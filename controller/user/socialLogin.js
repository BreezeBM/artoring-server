const dotenv = require('dotenv');

const axios = require('axios');
const { userModel } = require('../../model');
const { trimNaver, trimKakao, trimFacebook, trimUserData } = require('../tools');
const { sha256Encrypt } = require('../tools');

let path;
try {
  if (fs.existsSync(path)) {
    // file exists
    path = '.env';
  } else path = 'env';
} catch (err) {
  path = 'env';
}

dotenv.config({ path });
module.exports = async (req, res) => {
  try {
    const { type } = req.params;
    const { code, state, token, id } = req.body;
    let access_token, refresh_token;

    const redirect_uri = process.env.NODE_ENV === 'development' ? `https://localhost:3000/callback/${type}` : `https://artoring.com/callback/${type}`;
    let url, clientSecret, clientId, contentType;

    if (type === 'kakao' || type === 'naver') {
      if (type === 'kakao') {
        url = 'https://kauth.kakao.com/oauth/token?';
        contentType = 'application/x-www-form-urlencoded;charset=utf-8';
        clientId = process.env.KAKAO_ID;
        clientSecret = process.env.KAKAO_SEC;
      } else if (type === 'naver') {
        url = 'https://nid.naver.com/oauth2.0/token?';
        contentType = 'application/x-www-form-urlencoded;charset=utf-8';
        clientId = process.env.NAVER_ID;
        clientSecret = process.env.NAVER_SEC;
      }

      const response = await axios.get(url.concat(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}&state=${state}`), {
        'Content-Type': contentType
      });

      // 선언없이 구조분해 할당을 사용/
      ({ access_token, refresh_token } = response.data);
    }
    let proof;
    if (type === 'facebook') proof = sha256Encrypt(999, token, process.env.FACEBOOK_SEC);

    const api_url = type === 'naver'
      ? 'https://openapi.naver.com/v1/nid/me' // 네이버
      : type === 'kakao'
        ? 'https://kapi.kakao.com//v2/user/me' // 카카오
        : `https://graph.facebook.com/v11.0/${id}?fields=id,name,picture,birthday,email,gender&appsecret_proof=${proof}&access_token=${token}`; // 페이스북

    type !== 'facebook'
      ? response = await axios.get(api_url, { headers: { Authorization: access_token.includes('Bearer') ? access_token : `Bearer ${access_token}` } })
      : response = await axios.get(api_url);

    const userData =
      response.data.resultcode
        ? trimNaver(response.data.response)
        : response.data.kakao_account
          ? trimKakao(response.data.kakao_account)
          : trimFacebook(response.data);
    const registered = await userModel.findOne({ email: userData.email });
    const returnToken = access_token || token;

    const trimedData = {};

    if (registered) {
      trimedData.interestedIn = registered.interestedIn;
      trimedData.email = registered.email;
      trimedData.isMentor = registered.isMentor;
      trimedData.likedCareerEdu = registered.likedCareerEdu;
      trimedData.likedMentor = registered.likedMentor;
      trimedData.verifiedEmail = registered.verifiedEmail;

      res.status(200).json({ accessToken: returnToken || token, trimedData });
    } else {
      trimUserData(userData);

      userData.verifiedEmail = true;

      await userModel.create(userData);

      res.status(200).json({ accessToken: returnToken || token, userData, signup: true });
    }
  } catch (e) {
    console.log('\n', e, e.response ? e.response.data : '');
    res.status(500).send(e.message);
  }
}
;
