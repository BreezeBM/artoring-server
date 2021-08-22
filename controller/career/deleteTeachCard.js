const { careerTeachCardModel, adminModel } = require('../../model');
const { verifyJWTToken, aesDecrypt, AdminAccessException } = require('../tools');

module.exports = async (req, res) => {
  // delete 메서드는 바디를 가지지 않는다고 가정한다.
  // 어드민에서만 삭제를 진행해야 한다. 클라이언트에서는 보여지기만 해야 한다.

  // 헤더로 전달받은 JWT 토큰을 디코드 한다.
  const decode = await verifyJWTToken(req);

  switch (decode) {
    case 401: {
      res.staus(401).send();
      break;
    }
    case 403: {
      res.staus(403).send();
      break;
    }
    default: {
      try {
        // 클라이언트에서 전달받은 삭제할 카드의 id
        const { id: _id } = req.params;
        const { name, accessKey } = decode;

        // 해당 핸들러는 어드민만 접근해야 하기때문에, 어드민 권한이 존재하는지 확인하는 용도.
        if (!accessKey) throw new AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = await aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new AdminAccessException('no match found');

        // 해당 카드 제거.
        await careerTeachCardModel.findOneAndDelete({ _id });

        res.status(204).send();
      } catch (e) {
        res.status(500).send(e.message);
      }
      break;
    }
  }
}
;
