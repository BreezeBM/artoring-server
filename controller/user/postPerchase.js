import { userModel, purchaseHistoryModel, mentoringModel, mongoose } from '../../model/index.js';
import { tool } from '../tools/index.js';
// const { verifyJWTToken, verifyAndCallback, sha256Encrypt } = require('../tools');

export default async (req, res) => {
  const { cardId, userId, reservationType, startDate, endDate } = req.body;
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });
    return;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

  try {
    if (type === 'email') {
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
        default: {
          const { _id } = decode;
          const session = await purchaseHistoryModel.startSession();

          const targetData = await mentoringModel.findOne({ _id: cardId }).select({ price: 1, startDate: 1, endDate: 1 });

          // 같은 멘토링 5회 초과 예약 금지
          const reserveTimes = await purchaseHistoryModel.find({ targetId: cardId, userId: _id });
          if (reserveTimes.length > 5) res.status(409).send('exceed limits');
          else {
            const transactionOptions = {
              readPreference: 'primary',
              readConcern: { level: 'majority' },
              writeConcern: { w: 'majority' }
            };
            let createdDoc;
            // 사실 몽고디비는 하나의 도큐먼트에 대해 atomic 하다...
            // 혹시몰라 우선은 transaction을 사용함.
            await session.withTransaction(() => {
              return purchaseHistoryModel.create(
                {
                  userId: _id,
                  targetId: cardId,
                  price: targetData.price,
                  bookedStartTime: startDate || targetData.startDate,
                  bookedEndTime: endDate || targetData.endDate,
                  // 아임포트에서 관리하는 merchant_id 는 40글자가 최대이다.
                  merchantUid: `mid_${tool.sha256Encrypt(36, _id, Date().toString())}`,
                  originType: reservationType,
                  loginType: type,
                  startDate,
                  endDate,
                  questions: ['', '', '']
                })
                .then((data) => {
                  createdDoc = data;
                  return mentoringModel.findById({ _id: mongoose.Types.ObjectId(cardId) });
                })
                .then((data) => {
                  // 예약이 완료되지 않았더라도 예약자 추가시켜 추가 예약을 방지
                  if (data.joinedParticipants >= data.maximumParticipants) res.status(400).send();
                  else {
                    createdDoc.programTitle = data.title;
                    return userModel.findById({ _id: mongoose.Types.ObjectId(_id) });
                  }
                })
                .then(data => {
                  // 20분 이후에도 결제하지 않았다면 결제 취소시킴
                  setTimeout((merchantUid) => {
                    purchaseHistoryModel.findOne({ merchant_uid: merchantUid })
                      .then(data => {
                        if (data && data.progress === 'inprogress') {
                          purchaseHistoryModel.findByIdAndDelete({ _id: mongoose.Types.ObjectId(data._id) })
                            .then(() => {
                              return mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(data.targetId) }, { $inc: { joinedParticipants: -1 } });
                            })
                            .then(() => {});
                        }
                      });
                  }, 1000 * 60 * 20, createdDoc.merchantUid);

                  return mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(cardId) }, { $inc: { joinedParticipants: 1 } });
                });
            }, transactionOptions);
            session.endSession();
            res.status(201).send(createdDoc);
          }
        }
      }
    } else {
      tool.verifyAndCallback(async () => {
        const session = await purchaseHistoryModel.startSession();

        const targetData = await mentoringModel.findOne({ _id: cardId }).select({ price: 1, startDate: 1, endDate: 1 });

        const transactionOptions = {
          readPreference: 'primary',
          readConcern: { level: 'majority' },
          writeConcern: { w: 'majority' }
        };
        const createdDoc = {};
        await session.withTransaction(() => {
          return purchaseHistoryModel.create(
            {
              userId,
              targetId: cardId,
              price: targetData.price,
              bookedStartTime: startDate || targetData.startDate,
              bookedEndTime: endDate || targetData.endDate,
              merchantUid: `mid_${tool.sha256Encrypt(36, userId, Date().toString())}`,
              originType: reservationType,
              loginType: type,
              startDate,
              endDate,
              questions: ['', '', '']
            })
            .then((data) => {
              for (const n of Object.keys(data._doc)) { createdDoc[n] = data._doc[n]; }
              return mentoringModel.findById({ _id: mongoose.Types.ObjectId(cardId) });
            })
            .then((data) => {
              // 예약이 완료되지 않았더라도 예약자 추가시켜 추가 예약을 방지
              if (data.joinedParticipants >= data.maximumParticipants) res.status(400).send();
              else {
                createdDoc.programTitle = data._doc.title;
                return userModel.findById({ _id: mongoose.Types.ObjectId(userId) });
              }
            })
            .then(data => {
              setTimeout((merchantUid) => {
                purchaseHistoryModel.findOne({ merchantUid })
                  .then(data => {
                    if (data && data.progress === 'inprogress') {
                      purchaseHistoryModel.findByIdAndDelete({ _id: mongoose.Types.ObjectId(data._id) })
                        .then((data) => {
                          return mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(data.targetId) }, { $inc: { joinedParticipants: -1 } });
                        })
                        .then(() => {});
                    }
                  });
              }, 1000 * 60 * 20, createdDoc.merchantUid);
              return mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(cardId) }, { $inc: { joinedParticipants: 1 } });
            });
        }, transactionOptions);
        session.endSession();
        res.status(201).send(createdDoc);
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
