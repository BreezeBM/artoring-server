const { userModel } = require('../../model');
const { verifyJWTToken, createJWT, aesDecrypt } = require('../tools');

module.exports = async (req, res) => {
  const { token } = req.body;
  req.headers.authorization = `Bearer ${token}`;
  console.log(req.headers.authorization);

  try {
    const decode = await verifyJWTToken(req);

    switch (decode) {
      case 401: {
        res.status(409).send();
        break;
      }
      case 403: {
        res.staus(409).send();
        break;
      }
      default: {
        const { encryptEmail } = decode;
        console.log(decode);
        const email = aesDecrypt(encryptEmail);
        // 멘터 혹은 커리어 교육 카드 좋아요에대해 공통으로 사용하기 위함.
        const userData = await userModel.findOneAndUpdate({ email }, { $set: { verifiedEmail: true } }, { new: true })
          .select({ _id: 1, name: 1, thumb: 1, nickName: 1, email: 1, isMentor: 1, likedCareerEdu: 1, likedMentor: 1, verifiedEmail: 1, createdAt: 1 });

        const token = await createJWT({ _id: userData._id, name: userData.name }, 3600);

        res.json({ accessToken: token, profile: userData });
        break;
      }
    }
  } catch (e) {
    console.log(e);
    if (e.type) { res.status(e.type).send(e.message); } else { res.status(500).send(e.message); }
  }
}
;
