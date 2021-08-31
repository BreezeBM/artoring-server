const { reviewModel, purchaseHistoryModel, userModel, mongoose, mentoringModel } = require('../../model');
const { verifyJWTToken } = require('../tools');
module.exports = async (req, res) => {
  const { loginType } = req.body;
  if (loginType) {
    if (loginType === 'email') {
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
          default: {
            const { _id, name } = decode;
            const { originType, rate, targetId, text, userName, userThumb } = req.body;

            let reviewId;
            userModel.findOne({ _id: mongoose.Types.ObjectId(_id), name })
              .then(userData => {
                return reviewModel.create({
                  userThumb, userName, userId: userData._id, originType, targetId, text, rate
                });
              })
              .then((data) => {
                reviewId = data._id;
                return mentoringModel.findById(mongoose.Types.ObjectId(targetId));
              })
              .then(cardData => {
                const { rateCount, rate: prevRate } = cardData;
                const previous = rateCount === 0 ? 0 : rateCount * prevRate;

                return mentoringModel.findByIdAndUpdate(targetId, {
                  $set: {
                    rateCount: rateCount + 1,
                    rate: (previous + rate) / (rateCount + 1)
                  },
                  $push: {
                    reviews: reviewId
                  }
                });
              })
              .then(() => {
                return purchaseHistoryModel.findByIdAndUpdate(_id, { $set: { isReviewed: true } });
              })
              .then(() => res.status(201).send())
              .catch(e => {
                console.log(e);
                res.status(500).send();
              })
            ;
          }
            break;
        }
      } catch (e) {
        console.log(e);
        res.json(e.message);
      }
    } else {
      const { originType, rate, targetId, text, _id, userName, userThumb, userId } = req.body;

      let reviewId;
      reviewModel.create({
        userThumb, userName, userId, originType, targetId, text, rate
      })
        .then((data) => {
          reviewId = data._id;
          return mentoringModel.findById(mongoose.Types.ObjectId(targetId));
        })
        .then(cardData => {
          const { rateCount, rate: prevRate } = cardData;
          const previous = rateCount === 0 ? 0 : rateCount * prevRate;

          return mentoringModel.findByIdAndUpdate(targetId, {
            $set: {
              rateCount: rateCount + 1,
              rate: (previous + rate) / (rateCount + 1)
            },
            $push: {
              reviews: reviewId
            }
          });
        })
        .then(() => {
          return purchaseHistoryModel.findByIdAndUpdate(_id, { $set: { isReviewed: true } });
        })
        .then(() => res.status(201).send())
        .catch(e => {
          console.log(e);
          res.status(500).send();
        });
    }
  }
};
