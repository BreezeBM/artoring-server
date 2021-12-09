// TODO
// get, 정산 요청 리스트를 반환.
// post, 정산 완료 설정.

import dotenv from 'dotenv';

import { adminModel, purchaseHistoryModel, mentoringModel } from '../../model/index.js';
import { tool, date } from '../tools/index.js';
dotenv.config();

// 커리어 멘토링, 커리어 클래스에 따라 찾아봐야하는 데이터 위치가 다르다.
// 따라서 요청에 따라 데이터 쿼리를 분리해서 진행해야 한다.

// req.query = ?isGroup={boolean}&page={string}&size={string}
const get = async (req, res) => {
  try {
    const decode = tool.verifyJWTToken(req);
    switch (decode) {
      case 401: {
        res.status(200).json({ code: 401, message: 'not authorized' });
        break;
      }
      case 403: {
        res.status(200).json({ code: 403, message: 'need login' });
        break;
      }
      // verify  성공.
      default: {
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

        const { name, accessKey, authLevel } = await decode;

        if (!accessKey || authLevel === 0) throw new tool.AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = tool.aesDecrypt(accessKey);

        adminModel.find({ name, accessKey: accKey })
          .then((adminData) => {
            if (!adminData) throw new tool.AdminAccessException('no match found');

            const { isGroup, page, size } = req.query;
            const model = isGroup === 'true' ? mentoringModel : purchaseHistoryModel;

            // aggregation 파이프라인
            const pipeline = [
              {
                $match: {
                  'settlementInfo.progress': 0
                }
              },
              {
                $lookup: {
                  from: 'usermodels',
                  as: 'mentor',
                  let: !isGroup ? { mentorId: '$moderatorId' } : { mentorId: '$program.moderatorId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$mentorId']
                        }
                      }
                    },
                    {
                      $project: {
                        paymentInfo: '$mentor.paymentInfo'
                      }
                    }
                  ]
                }
              },
              {
                $unwind: '$mentor'
              },
              {
                $facet: {
                  cardList: [{ $skip: (Number(page) - 1) * (Number(size) || 10) }, { $limit: Number(size) || 10 }],
                  total: [
                    { $count: 'count' }
                  ]
                }
              },
              {
                $project: {
                  cardList: 1,
                  total: '$total.count'
                }
              },
              {
                $project: {
                  cardList: 1,
                  total: { $first: '$total' }
                }
              }
            ];

            if (isGroup !== 'true') {
              pipeline.splice(1, 0, {
                $lookup: {
                  from: 'mentoringmodels',
                  as: 'program',
                  localField: 'targetId',
                  foreignField: '_id'
                }
              }, {
                $unwind: '$program'
              });
            }

            model.aggregate(pipeline)
              .then(cardList => {
                res.status(200).send({ code: 200, data: cardList[0] });
              });
          });
      }
        break;
    }
  } catch (e) {
    console.log(e);
    if (e.message === 'need authorize' || e.message === 'no match found') {
      res.status(200).json({ code: 401, message: e.message });
    } else { res.status(200).json({ code: 500, message: e }); }
  }
};

// 정산 완료, 거절 정보를 업데이트 한다.
// req.body = {id: objectId, isGroup: boolean, isCompleted:boolean, reason?:string}
const post = async (req, res) => {
  try {
    const decode = tool.verifyJWTToken(req);
    switch (decode) {
      case 401: {
        res.status(200).json({ code: 401, message: 'not authorized' });
        break;
      }
      case 403: {
        res.status(200).json({ code: 403, message: 'need login' });
        break;
      }
      // verify  성공.
      default: {
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

        const { name, accessKey, authLevel } = await decode;

        if (!accessKey || authLevel === 0) throw new tool.AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = tool.aesDecrypt(accessKey);

        adminModel.find({ name, accessKey: accKey })
          .then((adminData) => {
            if (!adminData) throw new tool.AdminAccessException('no match found');

            const { id, isGroup, isCompleted, reason } = req.body;
            const model = isGroup ? mentoringModel : purchaseHistoryModel;

            model.findByIdAndUpdate(id, {
              $set: {
                settlementInfo: {
                  progress: isCompleted ? 1 : 99,
                  createdAt: new Date(date().add(9, 'hours').format()),
                  detailInfo: reason || ''
                }
              }
            })
              .then(() => {
                res.status(200).json({ code: 201, message: 'ok' });
              });
          });
      }
        break;
    }
  } catch (e) {
    console.log(e);
    if (e.message === 'need authorized' || e.message === 'no match found') {
      res.status(200).json({ code: 401, message: e.message });
    }
    res.status(200).json({ code: 500, message: e });
  }
};

export default { get, post }
;
