require('dotenv').config();
const axios = require('axios');

const { verifyJWTToken, createJWT, verifyAndCallback, sha256Encrypt } = require('../tools');

module.exports = async (req, res) => {
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });
    return null;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

  if (type) {
    if (type === 'email') {
      try {
        const decode = await verifyJWTToken(req);

        switch (decode) {
          case 401: {
            res.status(401).send();
            break;
          }
          case 403: {
            res.status(403).send();
            break;
          }
          default: {
            // 즉시만료 JWT 토큰을 생성하여 리턴. 유출되어도 염려 없다.
            const fakeToken = await createJWT({ email: 'expired' }, 0);
            res.cookie('authorization', fakeToken, {
              secure: true,
              httpOnly: true,
              // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
              maxAge: 0,
              sameSite: 'none',
              path: '/'
            }).status(201).json();

            break;
          }
        }
      } catch (e) {
        console.log(e);
        if (e.type) { res.status(404).send(e.message); } else { res.status(500).send(e.message); }
      }
    } else {
      verifyAndCallback(async (userinfo) => {
        let proof;

        if (type === 'facebook') {
          // 시크릿코드, 엑세스 토큰을 활용하여 증명데이터를 생성하고 이를 제거하고자하는 엑세스토큰과 함께 전송.

          proof = sha256Encrypt(999, accessToken.split(' ')[1], process.env.FACEBOOK_SEC);
          const response = await axios.get(`https://graph.facebook.com/${Number(userinfo.user_id)}/permissions?appsecret_proof=${proof}&access_token=${accessToken.split(' ')[1]}`);

          res.cookie('authorization', '', {
            secure: true,
            httpOnly: true,
            // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
            maxAge: 0,
            sameSite: 'none',
            path: '/'
          }).status(201).json();
        } else {
          // 네이버, 카카오 서버에 토큰 만료 신청. 자동으로 ref토큰까지 만료된다.
          const url = type === 'naver'
            ? `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${process.env.NAVER_ID}&client_secret=${process.env.NAVER_SEC}&access_token=${accessToken}&service_provider=NAVER`
            : 'https://kauth.kakao.com/v1/user/logout';

          const response = await axios.get(url, {
            headers: {
              authorization: accessToken
            }
          });

          res.cookie('authorization', '', {
            secure: true,
            httpOnly: true,
            // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
            maxAge: 0,
            sameSite: 'none',
            path: '/'
          }).status(201).json();
        }

        res.send();
      }, type, accessToken, res);
    }
  }
}
;
