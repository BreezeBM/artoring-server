const { userModel, purchaseHistoryModel, careerInfoModel, mentoringModel } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

module.exports = async (req, res) => {
  const { loginType: type, id, reservationType, startDate, endDate } = req.body;
  const { accessToken } = req.headers.authorization;

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

          const targetData = await mentoringModel.findOne({ _id: id }).select({ price: 1 });
          const transactionOptions = {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
          };
          await session.withTransaction(async () => {
            return await purchaseHistoryModel.create(
              {
                userId: _id,
                targetId: id,
                price: targetData.price,
                isGroup: reservationType === 'teaching',
                loginType: type,
                startDate,
                endDate
              });
          }, transactionOptions);
          session.endSession();
          res.status(201).send();
        }
      }
    } else {
      verifyAndCallback(async () => {
        const userInfo = await userModel.findOne({ _id: id }).select({ pwd: 0 });
        const session = await purchaseHistoryModel.startSession();

        const model = reservationType === 'teaching' ? mentoringModel : careerInfoModel;
        const targetData = await model.findOne({ _id: id }).select({ price: 1 });

        const transactionOptions = {
          readPreference: 'primary',
          readConcern: { level: 'local' },
          writeConcern: { w: 'majority' }
        };

        await session.withTransaction(() => {
          return purchaseHistoryModel.create(
            {
              userId: userInfo._id,
              targetId: id,
              price: targetData.price,
              originType: reservationType,
              loginType: type,
              startDate,
              endDate
            }, transactionOptions);
        });
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
