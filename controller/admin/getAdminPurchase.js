require('dotenv').config();
const { purchaseHistoryModel, adminModel } = require('../../model');
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

        const total = await purchaseHistoryModel.countDocuments({ inprogress: 'inprogress' });
        // const cardList = await purchaseHistoryModel.find({
        //   inprogress: 'inprogress'
        // }, null, {
        //   sort: { createdAt: 1 },
        //   skip: (req.query.page || 1 - 1) * 8,
        //   limit: 8
        // });
        const cardList = await purchaseHistoryModel.aggregate([
          { $match: { inprogress: 'inprogress' } },
          {
            $lookup: {
              from: 'mentoringmodels',
              as: 'mentoring',
              foreignField: '_id',
              localField: 'targetId'
            }
          }, {
            $unwind: '$mentoring'
          },
          {
            $lookup: {
              from: 'usermodels',
              as: 'user',
              foreignField: '_id',
              localField: 'userId'
            }
          }, {
            $unwind: '$user'
          }, {
            $lookup: {
              from: 'usermodels',
              as: 'mentor',
              foreignField: '_id',
              localField: 'mentoring.moderatorId'
            }

          }, {
            $unwind: '$mentor'
          }, {
            $project: {
              originType: '$originType', // 구매한 대상의 타입. 멘토 || 커리어 || ...
              price: '$price',
              bookedStartTime: '$bokkedStartTime',
              bookedEndTime: '$bookedEntTime',
              inprogress: '$inprogress',
              createdAt: '$createdAt',
              userName: '$user.name',
              email: '$user.email',
              phone: '$user.phone',
              tags: '$mentoring.tags',
              programThumb: '$mentoring.thumb',
              programTitle: '$mentoring.title',
              programStartDate: '$mentoring.startDate',
              programEndDate: '$mentoring.endDate',
              isGroup: '$mentoring.isGroup',
              moderatorName: '$mentor.name',
              _id: '$mentoring._id'
            }
          }, {
            $sort: {
              createdAt: 1
            }
          }, {
            $skip: (req.query.page - 1) * 8 || 1
          }, {
            $limit: 8
          }
        ]);

        res.status(200).json({ total, cardList });
      }
        break;
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
}
;
