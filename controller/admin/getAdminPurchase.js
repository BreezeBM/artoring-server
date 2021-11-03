require('dotenv').config();
import { purchaseHistoryModel, adminModel, mongoose } from '../../model/index.js'
import { tool } from "../tools/index.js"
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

        // 멘토링 카드의 _id정보
        if (req.params.id) {
          purchaseHistoryModel.aggregate([
            { $match: { targetId: mongoose.Types.ObjectId(req.params.id) } },
            {
              $lookup: {
                from: 'usermodels',
                as: 'users',
                let: { userId: '$userId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                  {
                    $project: {
                      thumb: '$thumb',
                      name: '$name',
                      nickName: '$nickName',
                      email: '$email',
                      gender: '$gender',
                      birth: '$birth',
                      phone: '$phone'
                    }
                  }
                ]
              }
            },
            { $unwind: '$users' },
            {
              $facet: {
                cardList: [{ $skip: (req.query.page - 1) * (req.query.size || 10) }, { $limit: Number(req.query.size) || 10 }],
                total: [
                  { $project: { users: '$users' } },
                  { $unwind: '$users' },
                  {
                    $group: {
                      _id: null,
                      count: { $sum: 1 }
                    }
                  }]
              }
            }
          ])
            .then(data => {
              res.status(200).json(data[0]);
            });
        } else {
          purchaseHistoryModel.aggregate([
            { $match: { progress: 'paid' } },
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
              $group: {
                _id: '$mentoring._id',
                originType: { $first: '$originType' }, // 구매한 대상의 타입. 멘토 || 커리어 || ...
                price: { $first: '$price' },
                createdAt: { $first: '$createdAt' },
                tags: { $first: '$mentoring.tags' },
                programThumb: { $first: '$mentoring.thumb' },
                programTitle: { $first: '$mentoring.title' },
                programStartDate: { $first: '$mentoring.startDate' },
                programEndDate: { $first: '$mentoring.endDate' },
                isGroup: { $first: '$mentoring.isGroup' },
                moderatorName: { $first: '$mentor.name' }
              }
            },
            {
              $facet: {
                cardList: [{ $skip: (req.query.page - 1) * (req.query.size || 8) }, { $limit: Number(req.query.size) || 8 }],
                total: [
                  {
                    $count: 'count'
                  }
                ]
              }
            }
          ])
            .then(cardList => {
              res.status(200).json(cardList[0]);
            });
        }
      }
        break;
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
}
;
