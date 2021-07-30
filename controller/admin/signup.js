const dotenv = require('dotenv');
const fs = require('fs');

let path = '.env';

try {
  if (fs.existsSync(path)) {
    // file exists
    path = '.env';
  } else path = 'env';
} catch (err) {
  path = 'env';
}

dotenv.config(path);

const { sha256Encrypt } = require('../tools');
const { adminModel } = require('../../model');

module.exports = async (req, res) => {
  try {
    const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV : process.env.HASHING_TIME_PRO;
    let { email, pwd } = req.body;
    for (let i = 0; i < hashingTime; i++) { pwd = sha256Encrypt(999, pwd); }

    // 접근 레벨(authorityLevel 은 1이 가장 작은 권한. 5가 맥스)
    await adminModel.create({ email, pwd, authorityLevel: 1 });

    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
}
;