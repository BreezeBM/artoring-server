const { careerInfoModel, adminModel, mongoose } = require('../../model');
const { verifyJWTToken, aesDecrypt, AdminAccessException } = require('../tools');

module.exports = async (req, res) => {
  // delete 메서드는 바디를 가지지 않는다고 가정한다.
  // 어드민에서만 삭제를 진행해야 한다. 클라이언트에서는 보여지기만 해야 한다.

  // 헤더로 전달받은 JWT 토큰을 디코드 한다.
  const decode = await verifyJWTToken(req);

  switch (decode) {
    case 401: {
      res.status(401).send();
      break;
    }
    case 403: {
      res.status(403).send();
      break;
    }
    default: {
      try {
        // 클라이언트에서 전달받은 삭제할 카드의 id
        const { id: _id } = req.params;
        const { name, accessKey, authLevel } = decode;
        if (authLevel === 0) return res.send(403);

        if (!accessKey) throw new AdminAccessException('need authorize');

        const accKey = await aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new AdminAccessException('no match found');

        // 해당 카드 제거.
        careerInfoModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(_id) })
          .then(() => {
            res.status(204).send();
          });
      } catch (e) {
        res.status(500).send(e.message);
      }
      break;
    }
  }
}
;
