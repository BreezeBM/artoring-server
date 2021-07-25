const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const { careerTeachCardModel, adminModel } = require('../../model');
const { verifyJWTToken, aesDecrypt, AdminAccessException } = require('../tools');

module.exports = async (req, res) => {
  // 어드민 토큰 검증
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
    // verify  성공.
    default: {
      try {
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

        const { name, accessKey } = decode;

        if (!accessKey) throw new AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = await aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new AdminAccessException('no match found');

        const {
          createrId,
          thumb,
          title,
          startDate,
          endDate,
          tag,
          category,
          maximumParticipants,
          availableTime,
          price,
          dom
        } = req.body;

        // 돔 퓨리파이어로 전달받은 돔을 살균함. 물론 전달받은 데이터는 URI 인코드 되어있음.
        const purified = DOMPurify.sanitize(decodeURIComponent(dom));

        const postingData = {
          thumb,
          title,
          startDate,
          endDate,
          tags: tag,
          category,
          moderatorId: createrId,
          detailInfo: purified,
          maximumParticipants,
          availableTime,
          price
        };

        await careerTeachCardModel.create(postingData);

        res.status(201).send();
      } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
      }
      break;
    }
  }
}
;
