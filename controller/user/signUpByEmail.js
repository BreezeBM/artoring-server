const { userModel } = require('../../model');
const { sha256Encrypt, sendEmail } = require('../tools');

module.exports = async (req, res) => {
  const { email, name, gender, birth, mobile, address } = req.body;
  let { password } = req.body;

  // 환경변수에따라 해싱하는 횟수와 사용되는 솔트의 값이 달라진다.
  const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV : process.env.HASHING_TIME_PRO;
  const salt = process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO;

  try {
    for (let i = 0; i < hashingTime; i++) { password = sha256Encrypt(999, password, salt); }

    if (email) {
      const data = await userModel.find({ email: email }).select({ thumb: 1, nickName: 1, email: 1, isMentro: 1, likedCareerEdu: 1, likedMentor: 1, createdAt: 1 });
      // 데이터가 존재하는 경우라면, 이미 가입한 경우
      if (data) {
        res.status(200).send({ message: '이미 가입된 이메일입니다.' });
      } else {
        // 유저 콜렉션에 데이터 생성. data를 구조분해 할당하여 userData라는 이름으로 사용한다.
        const { data: userData } = await userModel.create({ email, name, gender, birth, mobile, address, pwd: password });

        // 유저정보를 이용하여 구글 메일 서버를 활용하여 이메일을 보낸다
        sendEmail(userData, res);
      }
    } else {
      // 이메일이 없는경우
      res.send({ message: 'Invalid Access' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
