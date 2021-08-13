const { userModel, purchaseHistoryModel, careerInfoModel, mentoringModel } = require('../../model');
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
          const { _id, name } = decode;
          const session = await purchaseHistoryModel.startSession();

          const targetData = await mentoringModel.findOne({ _id: cardId }).select({ price: 1 });

          // 같은 멘토링 5회 초과 예약 금지
          const reserveTimes = await purchaseHistoryModel.find({ targetId: cardId, userId: _id });
          if (reserveTimes.length > 5) res.status(409).send('exceed limits');
          else {
            const transactionOptions = {
              readPreference: 'primary',
              readConcern: { level: 'local' },
              writeConcern: { w: 'majority' }
            };
            await session.withTransaction(async () => {
              return await purchaseHistoryModel.create(
                {
                  userId: _id,
                  targetId: cardId,
                  price: targetData.price,
                  originType: reservationType,
                  loginType: type,
                  startDate,
                  endDate
                });
            }, transactionOptions);
            session.endSession();
            res.status(201).send();
          }
        }
      }
    } else {
      console.log(req.body);
      verifyAndCallback(async () => {
        const session = await purchaseHistoryModel.startSession();

        const targetData = await mentoringModel.findOne({ _id: cardId }).select({ price: 1 });

        const transactionOptions = {
          readPreference: 'primary',
          readConcern: { level: 'local' },
          writeConcern: { w: 'majority' }
        };
        await session.withTransaction(async () => {
          return await purchaseHistoryModel.create(
            {
              userId,
              targetId: cardId,
              price: targetData.price,
              originType: reservationType,
              loginType: type,
              startDate,
              endDate
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
