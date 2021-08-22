require('dotenv').config();

const { sha256Encrypt } = require('../tools');
const { adminModel } = require('../../model');
const randWords = require('random-words');

module.exports = async (req, res) => {
  try {
    const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV_ADM : process.env.HASHING_TIME_PRO_ADM;
    const salt = process.env.NODE_ENV === 'development' ? process.env.SALT_DEV_ADM : process.env.SALT_PRO_ADM;
    let { email, pwd, name } = req.body;
    for (let i = 0; i < hashingTime; i++) { pwd = sha256Encrypt(999, pwd, salt); }

    const randomWords = randWords({ min: 3, exactly: 24, join: ' ' });

    const accessKey = sha256Encrypt(999, randomWords, salt);

    // 접근 레벨(authorityLevel 은 1이 가장 작은 권한. 5가 맥스)
    await adminModel.create({ email, pwd, authorityLevel: 1, accessKey, name });

    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
}
;
