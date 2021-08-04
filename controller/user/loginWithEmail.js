require('dotenv').config();
const { userModel } = require('../../model');
const { createJWT, sha256Encrypt } = require('../tools');

module.exports = async (req, res) => {
  let { password, email } = req.body;
  const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV : process.env.HASHING_TIME_PRO;
  const salt = process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO;

  try {
    for (let i = 0; i < hashingTime; i++) { password = sha256Encrypt(999, password, salt); }

    if (email) {
      const data = await userModel.find({ email, pwd: password }).select({ thumb: 1, nickName: 1, email: 1, isMentro: 1, likedCareerEdu: 1, likedMentor: 1, verifiedEmail: 1 });
      if (data) {
        res.status(200).send({ message: '이미 가입된 이메일입니다.' });
      } else {
        const token = await createJWT({ eamil: data.email, name: data.name });

        res.status(201).json({ accessToken: token, userData: data });
      }
    } else {
      res.status(400).send({ message: 'Invalid Access' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
