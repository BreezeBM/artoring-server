const { userModel } = require('../../model');
const { verifyJWTToken, aesDecrypt } = require('../tools');

module.exports = async (req, res) => {
  const { token } = req.body;
  req.headers.authorization = `Bearer ${token}`;
  console.log(req.headers.authorization);

  const decode = await verifyJWTToken(req);

  switch (decode) {
    case 401: {
      res.staus(409).send();
      break;
    }
    case 403: {
      res.staus(409).send();
      break;
    }
    default: {
      try {
        const { encryptEmail } = decode;
        console.log(decode);
        const email = aesDecrypt(encryptEmail);
        // 멘터 혹은 커리어 교육 카드 좋아요에대해 공통으로 사용하기 위함.
        await userModel.findOneAndUpdate({ email }, { $set: { verifiedEmail: true } });

        res.send();
      } catch (e) {
        console.log(e);
        if (e.type) { res.status(404).send(e.message); } else { res.status(500).send(e.message); }
      }
      break;
    }
  }
}
;
