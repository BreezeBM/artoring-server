const { userModel, purchaseHistoryModel, careerInfoModel, mentoringModel, mongoose } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

module.exports = async (req, res) => {
  const { loginType: type, cardId, userId, reservationType, startDate, endDate } = req.body;
  const accessToken = req.headers.authorization;
  try {
    if (type === 'email') {
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
                  originType: reservationType,
                  loginType: type,
                  startDate,
                  endDate
                })
                .then(() => {
                  return mentoringModel.findById({ _id: mongoose.Types.ObjectId(cardId) });
                })
                .then(data => {
                  if (data.joinedParticipants >= data.maximumParticipants) res.status(400).send();
                  else {
                    return mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(cardId) }, { $inc: { joinedParticipants: 1 } });
                  }
                });
            }, transactionOptions);
            session.endSession();
            res.status(201).send();
          }
        }
      }
    } else {
      verifyAndCallback(async () => {
        const session = await purchaseHistoryModel.startSession();

        const targetData = await mentoringModel.findOne({ _id: cardId }).select({ price: 1, startDate: 1, endDate: 1 });

        const transactionOptions = {
          readPreference: 'primary',
          readConcern: { level: 'majority' },
          writeConcern: { w: 'majority' }
        };
        await session.withTransaction(() => {
          return purchaseHistoryModel.create(
            {
              userId,
              targetId: cardId,
              price: targetData.price,
              bookedStartTime: startDate || targetData.startDate,
              bookedEndTime: endDate || targetData.endDate,
              originType: reservationType,
              loginType: type,
              startDate,
              endDate
            })
            .then(() => {
              return mentoringModel.findById({ _id: mongoose.Types.ObjectId(cardId) });
            })
            .then(data => {
              if (data.joinedParticipants >= data.maximumParticipants) res.status(400).send();
              else {
                return mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(cardId) }, { $inc: { joinedParticipants: 1 } });
              }
            });
        }, transactionOptions);
        session.endSession();
        res.status(201).send();
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
