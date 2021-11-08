import dotenv from 'dotenv';
import { tool } from '../tools/index.js';
import { purchaseHistoryModel, mentoringModel, userModel, adminModel, mongoose } from '../../model/index.js';
dotenv.config();
// const { verifyJWTToken, aesDecrypt, AdminAccessException } = require('../tools');

export default async (req, res) => {
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
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

        const { name, accessKey, authLevel } = decode;

        if (!accessKey || authLevel === 0) throw new tool.AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = await tool.aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new tool.AdminAccessException('no match found');

        const { id: _id, inProgress: progress } = req.body;

        purchaseHistoryModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(_id) }, { progress })
          .then((purchaseData) => {
            if (progress === 'completed') {
              mentoringModel.findById(purchaseData.targetId)
                .then((programData) => userModel.findOneAndUpdate({ _id: programData.moderatorId }, { $inc: { 'mentor.settledAmount': programData.price } }));
            }
          });

        res.status(200).json();
      }
        break;
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
}
;
