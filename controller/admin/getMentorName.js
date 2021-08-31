require('dotenv').config();
const { userModel, adminModel } = require('../../model');
const { verifyJWTToken, aesDecrypt, AdminAccessException } = require('../tools');

module.exports = async (req, res) => {
  try {
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
      // verify  성공.
      default: {
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

        const { name, accessKey, authLevel } = decode;

        if (!accessKey || authLevel === 0) throw new AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = await aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new AdminAccessException('no match found');

        let mentorData = await userModel.aggregate([

          {
            $search: {
              index: 'searchName',
              text: {
                query: `{ name: '${req.body.name}' }`,
                path: {
                  wildcard: '*'
                }
              }
            }
          }, {
            $lookup: {
              from: 'mentormodels',
              as: 'mentor',
              localField: '_id',
              foreignField: 'userId'
            }
          }
        ]);

        mentorData = mentorData.filter(ele => ele.mentor.length > 0);

        res.status(200).json(mentorData);
      }
        break;
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
}
;
