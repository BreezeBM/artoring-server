require('dotenv').config();
const jwt = require('jsonwebtoken');

const { aesEncrypt, sha256Encrypt } = require('../tools');
const { adminModel } = require('../../model');

module.exports = async (req, res) => {
  /*
   * 어드민 계정들은 email, pwd, 접근 레벨, 고유한 accessKey를 가집니다.
   */
  try {
    const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV : process.env.HASHING_TIME_PRO;
    const salt = process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO;
    let { email, pwd } = req.body;
    for (let i = 0; i < hashingTime; i++) { pwd = sha256Encrypt(999, pwd, salt); }

    let { name, accessKey, authorityLevel } = await adminModel.find({ email, pwd });

    accessKey = aesEncrypt(accessKey);

    const token = await jwt.sign({ name, accessKey, authorityLevel });
    res.status(200).json(token);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
}
;
