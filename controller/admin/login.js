require('dotenv').config();

const { aesEncrypt, aesDecrypt, createJWT, verifyJWTToken, AdminAccessException } = require('../tools');
const { adminModel } = require('../../model');
const bcrypt = require('bcrypt');

const recaptchaAction = 'login';

let userEmail;
module.exports = async (req, res) => {
  /*
   * 어드민 계정들은 email, pwd, 접근 레벨, 고유한 accessKey를 가집니다.
   */
  try {
    if (req.cookies.auth) {
      const decode = await verifyJWTToken(req);
      if (decode) {
        switch (decode) {
          case 401: {
            res.cookie('auth', '', { expires: new Date(Date.now()) });
            res.status(401).send();
            break;
          }
          case 403: {
            res.cookie('auth', '', { expires: new Date(Date.now()) });
            res.status(403).send();
            break;
          }
          // verify  성공.
          default: {
            // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
            // 엑세스키는 AES256으로 암호화 처리되어 있음.

            const { name, accessKey, authLevel } = decode;

            if (!accessKey || authLevel === 0) throw new Error(1); // ('need authorize. request increase auth level');

            // AES 암호화된 데이터를 복호하 하여 권한을 검증.
            const accKey = await aesDecrypt(accessKey);

            const adminData = await adminModel.findOne({ name, accessKey: accKey }).select({ name: 1, accessKey: 1 });

            if (!adminData) throw new AdminAccessException(2);

            res.status(200).json({ userData: adminData });
          }
        }
      }
    } else {
      const { email, pwd, token: captcha } = req.body;
      userEmail = email;

      // for (let i = 0; i < hashingTime; i++) { pwd = sha256Encrypt(999, pwd, salt); }

      const userData = await adminModel.findOne({ email }).select({ name: 1, pwd: 1, accessKey: 1, authorityLevel: 1, attempts: 1 });
      bcrypt.compare(pwd, userData.pwd)
        .then(async result => {
        // 캡챠 확인
          function createAssessment () {
            const projectID = process.env.CAPTCHA_ID;
            const recaptchaSiteKey = process.env.CAPTCHA_KEY;
            const token = captcha;
            const assessmentName = 'your_assessment_name';

            const { RecaptchaEnterpriseServiceClient } =
         require('@google-cloud/recaptcha-enterprise');

            // Create the reCAPTCHA client.
            const client = new RecaptchaEnterpriseServiceClient();

            // Set the properties of the event to be tracked.
            const event = ({
              token: token,
              siteKey: recaptchaSiteKey
            });

            const assessment = ({
              event: event,
              name: assessmentName
            });

            // google 프로젝트 ID를 기반으로 프로젝트 및 권한 등 조회
            const projectPath = client.projectPath(projectID);

            // Build the assessment request.
            const request = ({
              assessment: assessment,
              parent: projectPath
            });

            // 캡챠 토큰 조회
            return client.createAssessment(request);
          }
          // bcrypt 비밀번호 대조결과 일치
          if (result) {
            if (!userData.accessKey || userData.attempts <= 0) {
              throw new Error(3);
            } else {
              userData.accessKey = aesEncrypt(userData.accessKey);

              return createAssessment();
            }
          } else {
            throw new Error(4);
          }
        })
        .then(async response => {
        // Check if the token is valid.
          if (!response[0].tokenProperties.valid) {
            console.log('The CreateAssessment call failed because the token was: ' +
             response[0].tokenProperties.invalidReason);
          } else {
          // Check if the expected action was executed.
            if (response[0].tokenProperties.action === recaptchaAction) {
            // Get the risk score and the reason(s).
            // For more information on interpreting the assessment,
            // see: https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
              if (response[0].riskAnalysis.score <= 0.86) {
                throw new Error('suspected as bot');
              } else {
                const token = await createJWT({ name: userData.name, accessKey: userData.accessKey, authLevel: userData.authorityLevel }, 3600);

                delete userData.pwd;
                res.cookie('auth', token, {
                  secure: true,
                  httpOnly: true,
                  // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
                  maxAge: 3600 * 1000,
                  sameSite: 'none',
                  path: '/'
                }).status(200).json({ userData });
              }
            } else {
              console.log('The action attribute in your reCAPTCHA tag ' +
               'does not match the action you are expecting to score');
            }
          }
        })
        .catch(e => {
          adminModel.findOneAndUpdate({ email: userEmail }, { $inc: { attempts: -1 } })
            .then(() => {
              console.log(e.message, e.message === 4, typeof e.message);
              if (e.message === '1') res.status(200).json({ message: 'need authorize. request increase auth level', code: 401 });
              else if (e.message === '2')res.status(200).json({ message: 'invalied access', code: 401 });
              else if (e.message === '3')res.status(200).json({ message: 'need authorize', code: 403 });
              else if (e.message === '4')res.status(200).json({ message: 'no match found check email or password', code: 400 });
              else res.status(500).send();
            });
        });
    }
  } catch (e) {
    adminModel.findOneAndUpdate({ email: userEmail }, { $inc: { attempts: -1 } })
      .then(() => {
        if (e.message === '1') res.status(200).json({ message: 'need authorize. request increase auth level', code: 401 });
        else if (e.message === '2')res.status(200).json({ message: 'invalied access', code: 401 });
        else if (e.message === '3')res.status(200).json({ message: 'need authorize', code: 403 });
        else if (e.message === '4')res.status(200).json({ message: 'no match found check email or password', code: 400 });
        else res.status(500).send();
      });
  }
}
;
