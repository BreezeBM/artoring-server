require('dotenv').config();

const { createJWT, aesEncrypt } = require('./tools');

// 이메일 검증을 위해 이메일에 링크를 전달할 모듈
const nodemailer = require('nodemailer');
/**
 *
 * @param {*} data 유저데이터
 * @param {*} res response 객체
 */
module.exports = async (data, email = data.email, res) => {
  const { userData, accessToken } = data;
  // 이메일 검증용 링크에 담길 토큰에 저장할 이메일 정보를 암호화한다. URL에 저장되기도 하고, JWT는 인코딩된 데이터이기 때문에, 암호화를 진행한다.
  const encryptEmail = await aesEncrypt(email);

  // 암호화된 데이터를 바탕으로 10분짜리 JWT 토큰을 생성한다.
  const verifyToken = await createJWT({ encryptEmail }, 600);

  // 메일을 보내기위한 메일서버 설정
  const smtpTransport = nodemailer.createTransport({
    host: 'smtp.naver.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.STMP_NAVER_USER_ID,
      pass: process.env.STMP_NAVER_USER_PASSWORD
    }
  });

  const mailOptions = {
    from: `no-reply <${process.env.STMP_NAVER_USER_ID}@naver.com>`,
    to: userData.email,
    subject: '[아토링] 인증 관련 이메일 입니다',
    html: `<table style="border-collapse: collapse; width: 490px; margin-left: auto; margin-right: auto; height: 435px;" border="0">
<tbody>
<tr style="height: 353px;">
<td style="width: 490px; height: 353px;">
<div><img style="width: 114px; height: 17px; display: block; margin-left: auto; margin-right: auto; padding-bottom: 55px;" src="https://artoring.com/image/logo.png" alt="로고" /></div>
<div style="text-align: center;"><img style="margin-bottom: 14px;" src="https://artoring.com/image/check.png" alt="체크" width="48" height="50" />
<div style="font-family: NanumSquareRoundOTFEB; font-size: 24px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.25; letter-spacing: normal; color: #ff4a70; padding-bottom: 30px;">이메일 주소를 인증해 주세요</div>
<div><strong><span style="font-size: 14pt; font-family: NanumSquareRound;">안녕하세요 아토링입니다!</span></strong></div>
<div style="margin-bottom: 50px;"><span style="font-size: 14pt; font-family: NanumSquareRoundOTFEB;">아래 버튼을 클릭하여 인증을 완료해 주세요!</span></div>
<a href="${process.env.NODE_ENV !== 'development' ? `https://artoring.com/verify?token=${verifyToken}` : `https://localhost:3000/verify?token=${verifyToken}`}" target="_blank" rel="noopener"><button style="width: 336px; height: 50px; border-radius: 10px; background-color: #000000; font-family: NanumSquareRoundOTFEB; font-size: 16px; font-weight: normal; font-stretch: noraml; line-heigth: 1.69; letter-spacing: normal; color: #ffffff;">이메일 주소 인증</button></a></div>
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
</table>
`
  };
  await smtpTransport.sendMail(mailOptions, (error, responses) => {
    if (error) {
      smtpTransport.close();
      console.log(error);
      return res.status(400).send();
    } else {
      /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
      smtpTransport.close();
      return res.status(200).json({ responses, accessToken });
    }
  });
}
;
