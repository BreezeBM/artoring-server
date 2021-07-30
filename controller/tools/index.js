require('dotenv').config();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { trimKakao, trimNaver, trimFacebook, trimUserData } = require('./profileTrim');
const axios = require('axios');
/**
 * * 자주 사용되는 함수들이 작성되어 있음
 */

const verifyJWTToken = async (req) => {
  if (!req.headers.authorization) return 401;
  else {
    if (req.headers.authorization.indexOf('Bearer') < 0) return 401;
    const token = req.headers.authorization.split(' ')[1];
    const decode = await jwt.verify(token, process.env.NODE_ENV === 'development' ? process.env.JWT_SEC_KEY_DEVELOP : process.env.JWT_SEC_KEY_PRODUCTION);

    if (!decode) return 403;
    else return decode;
  }
};

// 페이스북 킹명 해쉬 및 여러 해싱에 사용됨.
const sha256Encrypt = (slice, key, salt) => {
  return crypto
    .createHmac('sha256', salt)
    .update(key)
    .digest('hex')
    .slice(0, slice);
};

// 어드민 데이터 암호화에 사용됨
const aesEncrypt = (string) => {
  const key = sha256Encrypt(32, process.env.NODE_ENV === 'development' ? process.env.KEY_FROM_DEVELOP : process.env.KEY_FROM_PRODUCTION);

  const iv = sha256Encrypt(16, process.env.NODE_ENV === 'development' ? process.env.KEY_IV_DEVELOP : process.env.KEY_IV_PRODUCTION);

  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  let result = cipher.update(string, 'utf8', 'hex');
  result += cipher.final('hex');

  return result;
};

// 어드민 데이터 복호화에 사용됨.
const aesDecrypt = (string) => {
  const key = sha256Encrypt(32, process.env.NODE_ENV === 'development' ? process.env.KEY_FROM_DEVELOP : process.env.KEY_FROM_PRODUCTION);

  const iv = sha256Encrypt(16, process.env.NODE_ENV === 'development' ? process.env.KEY_IV_DEVELOP : process.env.KEY_IV_PRODUCTION);

  const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
  let result = decipher.update(string, 'hex', 'utf8');
  result += decipher.final('utf8');

  return result;
};

// 어드민 요청을 처리하는 도중 에러시 throw를 하기위한 템플릿
const AdminAccessException = (message) => {
  this.message = message;
  this.toString = () => this.message.toString();
};

// 유저의 요청를 처리하는도중에 에러시 throw를 하기위한 템플릿
function UserException (type, message) {
  this.type = type;
  this.message = message;
  this.toString = function () {
    return this.message;
  };
}

// 소셜 로그인 토큰 검증 및 재시도 코드가 너무 길어서 분리함.
// 또한 유저 정보를 요청하는 로직이 포함되어 있으니, 전달받은 유저정보를 바탕으로
// 쿼리를 진행하면 그만.
/**
 *
 * @param {*} callback 토큰 증명이후 실행할것을 함수로 전달
 * @param {*} type  로그인 타입. 'kakao', 'naver', 'facebook'
 * @param {*} accessToken // 'Bearer ....'라는 값이 저장된 토큰
 * @param {*} res // req, res할때 그것
 */
const verifyAndCallback = async function (callback, type, accessToken, res) {
  let appSecret;
  if (type === 'facebook') {
    const response = await axios.get(`https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_ID}&client_secret=${process.env.FACEBOOK_SEC}&grant_type=client_credentials`);
    appSecret = response.data.access_token;
  }

  const proof = sha256Encrypt(999, accessToken.split(' ')[1], process.env.FACEBOOK_SEC);
  const checkTokenUrl = type === 'kakao' ? 'https://kapi.kakao.com/v1/user/access_token_info' : type === 'naver' ? 'https://openapi.naver.com/v1/nid/verify' : `https://graph.facebook.com/debug_token?input_token=${accessToken.split(' ')[1]}&access_token=${appSecret}&appsecret_proof=${proof}`;
  let getUserDataUrl = type === 'kakao' ? 'https://kapi.kakao.com/v2/user/me' : 'https://openapi.naver.com/v1/nid/me';
  axios.get(checkTokenUrl, type !== 'facebook'
    ? {
        headers: {
          authorization: accessToken
        }
      }
    : null)
    .then(async response => {
      if (type === 'facebook') {
        const { data } = response.data;
        const { is_valid: isValid, user_id: userId } = data;
        if (!isValid) {
          console.log('facbook token dead, ', response);
          res.status(400).json({ code: 400, desc: 'token expired' });
          return;
        }
        getUserDataUrl = `https://graph.facebook.com/v11.0/${userId}?fields=email&appsecret_proof=${proof}&access_token=${accessToken.split(' ')[1]}`;
      }
      const { data } = await axios.get(getUserDataUrl, type !== 'facebook'
        ? {
            headers: {
              authorization: accessToken
            }
          }
        : null);

      callback(data, accessToken);
    }).catch(err => {
      console.log(err);
      if (err.message.code !== -1 || err.message.code !== -2) {
        console.log('token expired', err);
        res.status(400).json({ code: 400, desc: 'token expired' });
      } else {
        let count = 0;
        const timer = setInterval(async (...args) => {
          if (count >= args[0]) {
            res.status(500).json({ code: 500, desc: 'OAuth Server no response' });
            clearInterval(timer);
          } else {
            try {
              await axios.get(checkTokenUrl, type !== 'facebook'
                ? {
                    headers: {
                      authorization: accessToken
                    }
                  }
                : null);
              const UserInfo = await axios.get(getUserDataUrl, type !== 'facebook'
                ? {
                    headers: {
                      authorization: accessToken
                    }
                  }
                : null);

              callback(UserInfo, accessToken);
            } catch (e) {
              count++;
            }
          }
        }, 100, 10);
      }
    });
};

module.exports = { verifyJWTToken, verifyAndCallback, sha256Encrypt, aesEncrypt, aesDecrypt, AdminAccessException, UserException, trimKakao, trimNaver, trimFacebook, trimUserData };
