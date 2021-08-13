
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');

require('dotenv').config();

/**
 * * 자주 사용되는 함수, 생성자들이 작성되어 있음
 */

/**
 *
 * @param {*} req
 * @returns
 * 401 : 헤더에 토큰이 없음
 * 403 : JWT 해독 실패
 * decode: JWT 해독 결과 데이터
 */
const verifyJWTToken = async (req) => {
  if (!req.headers.authorization) return 401;
  else {
    try {
      if (req.headers.authorization.indexOf('Bearer') < 0) return 401;
      const token = req.headers.authorization.split(' ')[1];

      const decode = jwt.verify(token, process.env.NODE_ENV === 'development' ? process.env.JWT_SEC_KEY_DEVELOP : process.env.JWT_SEC_KEY_PRODUCTION);

      if (!decode) return 403;
      else return decode;
    } catch (e) {
      return 401;
    }
  }
};

/**
 *
 * @param {*} data {email, name}
 * @param {*} time 유효시간. 기본 1시간으로 해야함.
 * @returns
 */
const createJWT = (data, time = 60) => {
  const option = {
    algorithm: 'HS256', // 해싱 알고리즘
    expiresIn: time, // 토큰 유효 기간
    issuer: 'https://back.artoring.com' // 발행자
    // audience: sha256Encrypt(999, data._id ? data._id.toString() : data.encryptEmail ? data.encryptEmail : undefined, 'https://back.artoring.com')
  };

  return jwt.sign(data, process.env.NODE_ENV === 'development' ? process.env.JWT_SEC_KEY_DEVELOP : process.env.JWT_SEC_KEY_PRODUCTION, option);
};

// 페이스북 키 증명 해쉬 및 여러 해싱에 사용됨.
const sha256Encrypt = (slice, key, salt) => {
  return crypto
    .createHmac('sha256', salt)
    .update(key)
    .digest('hex')
    .slice(0, slice);
};

// 어드민 데이터 암호화에 사용됨
const aesEncrypt = (string) => {
  const key = sha256Encrypt(32,
    process.env.NODE_ENV === 'development' ? process.env.KEY_FROM_DEVELOP : process.env.KEY_FROM_PRODUCTION,
    process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO
  );

  const iv = sha256Encrypt(16,
    process.env.NODE_ENV === 'development' ? process.env.KEY_IV_DEVELOPMENT : process.env.KEY_IV_PRODUCTION,
    process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO
  );

  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  let result = cipher.update(string, 'utf8', 'hex');
  result += cipher.final('hex');

  return result;
};

// 어드민 데이터 복호화에 사용됨.
const aesDecrypt = (string) => {
  const key = sha256Encrypt(32,
    process.env.NODE_ENV === 'development' ? process.env.KEY_FROM_DEVELOP : process.env.KEY_FROM_PRODUCTION,
    process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO
  );

  const iv = sha256Encrypt(16,
    process.env.NODE_ENV === 'development' ? process.env.KEY_IV_DEVELOPMENT : process.env.KEY_IV_PRODUCTION,
    process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO
  );

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

const verifyAndCallback = async function (callback, type, accessToken, res, userModel) {
  let appSecret;
  if (type === 'facebook') {
    const response = await axios.get(`https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_ID}&client_secret=${process.env.FACEBOOK_SEC}&grant_type=client_credentials`);
    appSecret = response.data.access_token;
  }

  // 페이스북은 시크릿키, 엑세스 토큰을 이용하면 HMAC으로 해싱하여 전달해준 데이터를 검증함. `Bearer `는 빼고 엑세스토큰을 HMAC으로 해싱한다.
  const proof = sha256Encrypt(999, accessToken.split(' ')[1], process.env.FACEBOOK_SEC);
  // 3사간 토큰검증 URL들
  const checkTokenUrl = type === 'kakao' ? 'https://kapi.kakao.com/v1/user/access_token_info' : type === 'naver' ? 'https://openapi.naver.com/v1/nid/verify' : `https://graph.facebook.com/debug_token?input_token=${accessToken.split(' ')[1]}&access_token=${appSecret}&appsecret_proof=${proof}`;
  axios.get(checkTokenUrl, type !== 'facebook'
    ? {
        headers: {
          authorization: accessToken
        }
      }
    : null)
    .then(async response => {
      callback();

      // 토큰 검증 에러 핸들러
    }).catch(err => {
      console.log(err);
      // 카카오 토큰 에러. -1, -2는 카카오의 서버응답이 없거나 인수를 잘못 적었을때
      if (err.message.code !== -1 || err.message.code !== -2) {
        console.log('token expired', err);
        res.status(400).json({ code: 400, desc: 'token expired' });

        // 사실 이 다음에는 페이스북의 경우라면 장기 토큰 전환, 카카오/네이버는 리프레시토큰을 활용해서 새로운 토큰을 발급해야함.
        // 10번 동안 인터벌로 유효성 검사 시도.
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

              callback();
            } catch (e) {
              count++;
            }
          }
        }, 100, 10);
      }
    });
};

module.exports = { verifyJWTToken, createJWT, verifyAndCallback, sha256Encrypt, aesEncrypt, aesDecrypt, AdminAccessException, UserException };
