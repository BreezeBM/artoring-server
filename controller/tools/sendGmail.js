import * as googleapis from 'googleapis';
import path from 'path';
// const { google, gmail_v1 } = require('googleapis');

import dotenv from 'dotenv';

import { tool as tools } from './index.js';
dotenv.config();
// const { createJWT, aesEncrypt } = require('./tools');
const __dirname = path.resolve();

const sendGMAIL = async function (data, res, emailData, email = data.email) {
  const { userData, accessToken } = data;
  const encryptEmail = await tools.tool.aesEncrypt(email);
  const verifyToken = await tools.tool.createJWT({ encryptEmail }, 600);

  const authClient = new googleapis.google.auth.JWT({
  // keyFile: __dirname + '/../../credentials.json',
    keyFile: __dirname + '/config/s3.json',
    scopes: [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send'
    ],
    subject: 'no-reply@artoring.com'
  });

  await authClient.authorize();
  const gmail = new googleapis.gmail_v1.Gmail({ auth: authClient });

  // emailData가 있는 경우는 인증과 관련없는 메일 -> 로그인 처리가 되어서는 안된다.
  if (emailData) {
    const subject = emailData.subject;
    const utf8Subject = `=?utf-8?B?${
      Buffer.from(subject).toString('base64')
    }?=`;
    const messageParts = [
      'From: no-reply@artoring.com',
      `To: ${userData.email}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      emailData.html
    ];

    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'no-reply@artoring.com',
      requestBody: {
        raw: encodedMessage
      }
    });

    return res.status(200).json({ code: 200 });
  }

  // emailData가 없는 경우는 이메일 인증 메일 -> 로그인 처리
  if (!emailData) {
    const subject = '[아토링] 인증 관련 이메일 입니다.';
    const utf8Subject = `=?utf-8?B?${
      Buffer.from(subject).toString('base64')
    }?=`;
    const messageParts = [
      'From: no-reply@artoring.com',
      `To: ${userData.email}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      `<table style="border-collapse: collapse; width: 490px; margin-left: auto; margin-right: auto; height: 435px;" border="0">
          <tbody>
          <tr style="height: 353px;">
          <td style="width: 490px; height: 353px;">
          <div><img style="width: 114px; height: 17px; display: block; margin-left: auto; margin-right: auto; padding-bottom: 55px;" src="https://artoring.com/image/logo.png" alt="로고" /></div>
          <div style="text-align: center;"><img style="margin-bottom: 14px;" src="https://artoring.com/image/check.png" alt="체크" width="48" height="50" />
          <div style="font-family: NanumSquareRoundOTFEB; font-size: 24px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.25; letter-spacing: normal; color: #ff4a70; padding-bottom: 30px;">이메일 주소를 인증해 주세요</div>
          <div><strong><span style="font-size: 14pt; font-family: NanumSquareRound;">안녕하세요 아토링입니다!</span></strong></div>
          <div style="margin-bottom: 50px;"><span style="font-size: 14pt; font-family: NanumSquareRoundOTFEB;">아래 버튼을 클릭하여 인증을 완료해 주세요!</span></div>
          <a href="${
        process.env.NODE_ENV !== 'development'
          ? `https://artoring.com/verify?token=${verifyToken}`
          : `https://localhost:3000/verify?token=${verifyToken}`
      }" target="_blank" rel="noopener"><button style="width: 336px; height: 50px; border-radius: 10px; background-color: #000000; font-family: NanumSquareRoundOTFEB; font-size: 16px; font-weight: normal; font-stretch: noraml; line-heigth: 1.69; letter-spacing: normal; color: #ffffff;">이메일 주소 인증</button></a></div>
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
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'no-reply@artoring.com',
      requestBody: {
        raw: encodedMessage
      }
    });

    res.cookie('authorization', `Bearer ${accessToken} email`, {
      secure: true,
      httpOnly: true,
      // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
      maxAge: 3600 * 1000,
      sameSite: 'none',
      path: '/'
    });
    return res.status(200).json({ accessToken });
  }

  if (module === require.main) {
    sendGMAIL().catch(console.error);
  }
};

export default sendGMAIL;
