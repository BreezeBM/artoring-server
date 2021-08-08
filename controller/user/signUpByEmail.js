const { userModel } = require('../../model');
const { sha256Encrypt, sendEmail, createJWT } = require('../tools');

require('dotenv').config();

module.exports = async (req, res) => {
  const { email, name, gender, birth, mobile, address } = req.body;
  let { password } = req.body;

  try {
    if (email) {
      const data = await userModel.findOne({ email }).select({ thumb: 1, nickName: 1, email: 1, isMentor: 1, likedCareerEdu: 1, likedMentor: 1, createdAt: 1 });
      // 데이터가 존재하는 경우라면, 이미 가입한 경우
      if (data) {
        const accessToken = await createJWT({ _id: data._id, name: data.name }, 3600);
        res.status(409).send({ message: '이미 가입된 이메일입니다.', userData: data, accessToken });
      } else {
        // 환경변수에따라 해싱하는 횟수와 사용되는 솔트의 값이 달라진다.
        const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV : process.env.HASHING_TIME_PRO;
        const salt = process.env.NODE_ENV === 'development' ? process.env.SALT_DEV : process.env.SALT_PRO;

        for (let i = 0; i < hashingTime; i++) {
          password = await sha256Encrypt(999, password, salt);
        }
        // 유저 콜렉션에 데이터 생성. data를 구조분해 할당하여 userData라는 이름으로 사용한다.
        const userData = await userModel.create({
          email,
          name,
          gender,
          birth,
          mobile,
          address,
          pwd: password,
          interestedIn: [
            { name: '창업', val: false },
            { name: '취업', val: false },
            { name: '전문예술', val: false },
            { name: '프리랜서', val: false },
            { name: '대학원/유학', val: false },
            { name: '예술교육', val: false },
            { name: '연구개발', val: false },
            { name: '기획/창작/제작', val: false },
            { name: '크리에이터', val: false }, { name: '홍보마케팅', val: false },
            { name: '경영지원(인사 및 회계)', val: false },
            { name: '구분 외 관심사 or 기타', val: false }]
        });

        // 유저정보를 이용하여 구글 메일 서버를 활용하여 이메일을 보낸다
        sendEmail(userData, res);
      }
    } else {
      // 이메일이 없는경우
      res.status(400).send({ message: 'Invalid Access' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
