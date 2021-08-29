
const { reviewModel, purchaseHistoryModel, userModel, mongoose } = require('../../model');
const { verifyJWTToken } = require('../tools');
module.exports = async (req, res) => {
  const { type } = req.body;
  if (type) {
    if (type === 'email') {
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
            const { id: _id, name } = decode;
            const { originType, targetId, text, rate, _id: purchaseId } = req.body;

            userModel.findOne({ _id: mongoose.Types.ObjectId(_id), name })
              .then(userData => {
                return reviewModel.create({
                  userThumb: userData.thumb, userName: userData.name, originType, targetId, text, rate
                });
              })
              .then(() => {
                purchaseHistoryModel.findByIdAndUpdate(mongoose.Types.ObjectId(purchaseId), { $set: { isReviewd: true } });
                res.send();
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
      const { originType, id, targetId, text, rate } = req.body;

      userModel.findOne({ _id: mongoose.Types.ObjectId(id) })
        .then(userData => {
          return reviewModel.create({
            userThumb: userData.thumb, userName: userData.name, originType, targetId, text, rate
          });
        }).then(() => res.send());
    }
  }
};
