require('dotenv').config();

const { aesEncrypt, sha256Encrypt, createJWT, verifyJWTToken, AdminAccessException } = require('../tools');
const { adminModel } = require('../../model');

module.exports = async (req, res) => {
  /*
   * 어드민 계정들은 email, pwd, 접근 레벨, 고유한 accessKey를 가집니다.
   */
  try {
    const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV_ADM : process.env.HASHING_TIME_PRO_ADM;
    const salt = process.env.NODE_ENV === 'development' ? process.env.SALT_DEV_ADM : process.env.SALT_PRO_ADM;
    let { email, pwd } = req.body;

    for (let i = 0; i < hashingTime; i++) { pwd = sha256Encrypt(999, pwd, salt); }

    const userData = await adminModel.findOne({ email, pwd }).select({ name: 1, accessKey: 1, authorityLevel: 1 });

    if (!userData.accessKey) {
      res.status(403).send();
      return;
    }

    userData.accessKey = aesEncrypt(userData.accessKey);

    const token = await createJWT({ name: userData.name, accessKey: userData.accessKey, authLevel: userData.authorityLevel }, 3600);
    res.cookie('auth', token, {
      secure: true,
      httpOnly: true,
      // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
      maxAge: 3600 * 1000,
      sameSite: 'none',
      path: '/'
    });
    res.status(200).json({ userData });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
}
;
