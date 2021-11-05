import { userModel, adminModel, mongoose } from '../../model/index.js';
import { tool } from '../tools/index.js';
// const { verifyJWTToken, aesDecrypt, AdminAccessException } = require('../tools');

export default async (req, res) => {
  // 멘토링 카드를 등록하는게 아니라 멘토정보를 등록하는 메서드
  try {
    const decode = await tool.verifyJWTToken(req);
    switch (decode) {
      case 401: {
        res.status(401).send();
        break;
      }
      case 403: {
        res.status(403).send();
        break;
      }
      // verify  성공.
      default: {
        const { name, accessKey, authLevel } = decode;

        if (!accessKey || authLevel === 0) throw new tool.AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = await tool.aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new tool.AdminAccessException('no match found');

        const { _id, userName, descriptionForMentor, descriptionText, thumb, category } =
        req.body;
        userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) }, {
          $set: {
            isMentor: true,
            mentor: {
              name: userName,
              descriptionForMentor,
              descriptionText,
              category,
              thumb
            }
          }
        })
          .then(() => {
            res.status(200).send();
          })
          .catch(e => { throw e; });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
}
;
