require('dotenv').config();

const { createJWT, aesEncrypt } = require('./tools');

// 이메일 검증을 위해 이메일에 링크를 전달할 모듈
const nodemailer = require('nodemailer');
/**
 *
 * @param {*} data 유저데이터
 * @param {*} res response 객체
 */
module.exports = async (data, res) => {
  const token = await createJWT({ eamil: data.email, name: data.name });

  // 이메일 검증용 링크에 담길 토큰에 저장할 이메일 정보를 암호화한다. URL에 저장되기도 하고, JWT는 인코딩된 데이터이기 때문에, 암호화를 진행한다.
  const encryptEmail = await aesEncrypt(data.email);

  // 암호화된 데이터를 바탕으로 10분짜리 JWT 토큰을 생성한다.
  const verifyToken = await createJWT({ encryptEmail }, 10);

  // 메일을 보내기위한 메일서버 설정
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.STMP_USER_ID,
      pass: process.env.STMP_USER_PASSWORD
    }
  });

  const mailOptions = {
    from: '인사이드아트',
    to: 'scm0222@naver.com',
    subject: '[아토링]인증 관련 이메일 입니다',
    html: `<div style="height: 100%; width: 100%; background-color: #c8c8c8;">
<table style="border-collapse: collapse; width: 67.7898%; height: 185px; margin-left: auto; margin-right: auto; background-color: #ffffff;" border="1">
<tbody>
<tr style="height: 22px;">
<td style="width: 100%; height: 10px; vertical-align: top;">
<p>ART &amp; MENTORING - ARTORING.&nbsp; &nbsp;<img src="https://artoring.com/image/1628045973280.png" alt="" width="21" height="20" /></p>
</td>
</tr>
<tr style="height: 175px;">
<td style="width: 100%; vertical-align: top; height: 175px;">
<p>안녕하세요. ${data.name}님</p>
<p>아토링의 회원이 되신 것을 진심으로 환영합니다.</p>
<p>ID: ${data.email}</p>
<br>
<p>다음 링크를 클릭하여 계정을 활성화 합니다. 해당 링크는 10분 동안만 유효합니다.</p>
<br>
<a href="https://insideart-dev.artoring.com/verify?token=${verifyToken}">https://insideart-dev.artoring.com/verify?token=${verifyToken}</a>
<br>
<p>감사합니다!<br />인사이드 아트</p>
</td>
</tr>
</tbody>
</table>
</div>`
  };

  // 메일을 보낸이후 진행할 로직. 보내기 성공한 이후 엑세스토큰과 링크에 필요한 토큰을 리턴
  smtpTransport.sendMail(mailOptions, (error, responses) => {
    if (error) {
      smtpTransport.close();
      console.log(error);
      return res.status(400).send();
    } else {
      /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
      smtpTransport.close();
      return res.status(201).json({ accessToken: token });
    }
  });
}
;
