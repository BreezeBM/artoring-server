const { userModel } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {
  const { token } = req.body;
  req.body.authorization = token;

  const decode = verifyJWTToken(req);

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
        const { email } = decode;
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
