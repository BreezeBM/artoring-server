require('dotenv').config();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * * 자주 사용되는 함수, 생성자들이 작성되어 있음
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

const sha512Encrypt = (slice, key) => {
  return crypto
    .createHash('sha512')
    .update(key)
    .digest('hex')
    .slice(0, slice);
};

const aesEncrypt = (string) => {
  const key = sha512Encrypt(32, process.env.NODE_ENV === 'development' ? process.env.KEY_FROM_DEVELOP : process.env.KEY_FROM_PRODUCTION);

  const iv = sha512Encrypt(16, process.env.NODE_ENV === 'development' ? process.env.KEY_IV_DEVELOP : process.env.KEY_IV_PRODUCTION);

  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  let result = cipher.update(string, 'utf8', 'hex');
  result += cipher.final('hex');

  return result;
};

const aesDecrypt = (string) => {
  const key = sha512Encrypt(32, process.env.NODE_ENV === 'development' ? process.env.KEY_FROM_DEVELOP : process.env.KEY_FROM_PRODUCTION);

  const iv = sha512Encrypt(16, process.env.NODE_ENV === 'development' ? process.env.KEY_IV_DEVELOP : process.env.KEY_IV_PRODUCTION);

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

module.exports = { verifyJWTToken, aesEncrypt, aesDecrypt, AdminAccessException, UserException };
