const { userModel } = require('../../model');
const { createJWT, sha256Encrypt } = require('../tools');

module.exports = async (req, res) => {
  const { email, name, gender, birth, mobile, address } = req.body;
  let { password } = req.body;

  // 환경변수에따라 해싱하는 횟수와 사용되는 솔트의 값이 달라진다.
  const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV : process.env.HASHING_TIME_PRO;
  const salt = process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO;

  try {
    for (let i = 0; i < hashingTime; i++) { password = sha256Encrypt(999, password, salt); }

    if (email) {
      const data = await userModel.find({ email: email }).select({ thumb: 1, nickName: 1, email: 1, isMentro: 1, likedCareerEdu: 1, likedMentor: 1 });
      if (data) {
        res.status(200).send({ message: '이미 가입된 이메일입니다.' });
      } else {
        const insertData = await userModel.create({ email, name, gender, birth, mobile, address, pwd: password });
        const token = await createJWT({ eamil: data.email, name: data.name });

        res.status(201).json({ accessToken: token, userData: insertData });
      }
    } else {
      res.send({ message: 'Invalid Access' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
