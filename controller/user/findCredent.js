require('dotenv').config();
const bcrypt = require('bcrypt');
const { userModel, tokenModel, mongoose } = require('../../model');
const { sendEmail, createJWT, aesEncrypt, aesDecrypt, verifyJWTToken } = require('../tools');

module.exports = {
  // 아래 핸들러들은 로그인 없이 진행됨.
  // 이메일 찾기 요청 핸들러

  email: (req, res) => {
    const { userName: name, phone } = req.body;

    userModel.findOne({ name, phone }).select({ email: 1 })
      .then(userData => {
        if (userData) res.status(200).json({ code: 200, data: userData });
        else res.status(200).send({ code: 404, message: 'no match found' });
      });
  },

  // 비밀번호 찾기 요청 핸들러
  pwdReq: (req, res) => {
    const { email } = req.body;

    userModel.findOne({ email })
      .then(async userData => {
        if (!userData) res.status(200).send({ code: 404, message: 'no match found' });
        else {
          const encryptEmail = await aesEncrypt(email);

          // 암호화된 데이터를 바탕으로 10분짜리 JWT 토큰을 생성한다.
          const verifyToken = await createJWT({ encryptEmail }, 600);

          tokenModel.create({ name: verifyToken })
            .then(() => {
              sendEmail({ email }, email, res, {
                from: `no-reply <${process.env.STMP_NAVER_USER_ID}@naver.com>`,
                to: userData.email,
                subject: '[아토링] 비밀번호 관련 이메일 입니다',
                html: `<table style="border-collapse: collapse; width: 490px; margin-left: auto; margin-right: auto; height: 435px;" border="0">
              <tbody>
              <tr style="height: 353px;">
              <td style="width: 490px; height: 353px;">
              <div><img style="width: 114px; height: 17px; display: block; margin-left: auto; margin-right: auto; padding-bottom: 55px;" src="https://artoring.com/image/logo.png" alt="로고" /></div>
              <div style="text-align: center;"><img style="margin-bottom: 14px;" src="https://artoring.com/image/check.png" alt="체크" width="48" height="50" />
              <div style="font-family: NanumSquareRoundOTFEB; font-size: 24px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.25; letter-spacing: normal; color: #ff4a70; padding-bottom: 30px;">비밀번호 변경 안내</div>
              <div><strong><span style="font-size: 14pt; font-family: NanumSquareRound;">안녕하세요 아토링입니다!</span></strong></div>
              <div style="margin-bottom: 50px;"><span style="font-size: 14pt; font-family: NanumSquareRoundOTFEB;">아래 버튼을 클릭하여 비밀번호를 변경해 주세요!<br /><span style="font-size: 10pt; font-family: NanumSquareRound;">만약 비밀번호 변경을 시도한적이 없다면 아토링 비밀번호를 변경해 주세요</span></span></div>
              <div style="margin-bottom: 50px;"><span style="font-family: NanumSquareRound;"><strong><span style="font-size: 14pt; font-family: NanumSquareRoundOTFEB;">링크는 10분동안만 유효합니다!</span></strong></span></div>
              <a href="${process.env.NODE_ENV === 'development' ? `https://localhost:3000/changeCred?token=${verifyToken}` : `https://artoring.com/changeCred?token=${verifyToken}`}" target="_blank" rel="noopener"><button style="width: 336px; height: 50px; border-radius: 10px; background-color: #000000; font-family: NanumSquareRoundOTFEB; font-size: 16px; font-weight: normal; font-stretch: noraml; line-heigth: 1.69; letter-spacing: normal; color: #ffffff;">비밀번호 변경</button></a></div>
              </td>
              </tr>
              <tr style="height: 82px;">
              <td style="width: 490px; height: 82px; text-align: center;">
              <div style="text-align: left;">
              <table style="border-collapse: collapse; width: 69.5938%; height: 22px; margin-left: auto; margin-right: auto;" border="0">
              <tbody>
              <tr style="height: 22px;">
              <td style="width: 100%; height: 22px; text-align: center;"><span style="font-family: NanumSquareRound; font-size: 8pt; color: #b7b7b7; letter-spacing: normal;"><span style="color: #999999;">본 메일은 발신 전용입니다.&nbsp; 회신을 통한 문의는 처리되지 않습니다.</span><br /><span style="color: #999999;">서비스관련 궁금하신 사항은 아토링 고객센터에서 문의해주세요.</span></span></td>
              </tr>
              </tbody>
              </table>
              <p style="line-height: 1; text-align: center;"><span style="color: #999999; font-size: 8pt;">인사이드 아트 | 서울시 성북구 삼선교로 18나 길 5 b102호 | 대표 오설윤 | 사업자 번호 532-08-02173<br /></span></p>
              </div>
              </td>
              </tr>
              </tbody>
              </table>`
              });
            });
        }
      });
  },

  // 비밀번호 변경 검증 요청 핸들러
  pwdVerify: (req, res) => {
    try {
      const { token, pwd } = req.body;

      // 한번만 사용가능한 토큰중 사용되지 않은 토큰만 사용을 허가한다.
      tokenModel.findOneAndUpdate({ name: token, isUsed: false }, { $set: { isUsed: true } })
        .then(async tokenData => {
          if (tokenData) {
            const decode = await verifyJWTToken(null, token);

            switch (decode) {
              case 401: {
                res.status(200).send({ code: 401, message: 'token expired' });
                break;
              }
              case 403: {
                res.status(409).send();
                break;
              }
              default: {
                const { encryptEmail } = decode;

                const email = aesDecrypt(encryptEmail);
                // 멘터 혹은 커리어 교육 카드 좋아요에대해 공통으로 사용하기 위함.
                userModel.findOne({ email })
                  .select({ pwd: 1 })
                  .then((data) => {
                    if (data) {
                      return bcrypt.compare(pwd.password, data.pwd);
                    } else {
                      res.status(404).send({ message: '유저정보를 찾을수 없습니다.' });
                    }
                  })
                  .then(result => {
                    console.log(result);
                    // 비밀번호가 이전거와 일치
                    if (result) {
                      res.status(200).send({ code: 400, message: 'same password' });
                    } else {
                      const saltRounds = Number(process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV : process.env.HASHING_TIME_PRO);

                      bcrypt.hash(pwd.password, saltRounds)
                        .then((encrypted) => {
                          return userModel.findOneAndUpdate({ email }, {
                            $set: { pwd: encrypted }
                          });
                        })
                        .then(() => res.status(200).send({ code: 200, message: '' }));
                    }
                  })
                  .catch(e => {
                    console.log(e);
                    res.status(500).json(e.message);
                  });

                break;
              }
            }
          } else {
            res.status(200).send({ code: 404, message: 'already used' });
          }
        });
    } catch (e) {
      console.log(e);
      if (e.type) { res.status(e.type).send(e.message); } else { res.status(500).send(e.message); }
    }
  }
};
