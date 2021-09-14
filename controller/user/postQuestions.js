const { purchaseHistoryModel, mongoose } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');
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
            const { _id, questions } = req.body;

            purchaseHistoryModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) }, {
              $set: {
                questions
              }
            })
              .then((data) => {
                if (!data) res.status(404).send();
                else { res.status(201).send(); }
              })
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
      verifyAndCallback(() => {
        const { _id, questions } = req.body;

        purchaseHistoryModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) }, {
          $set: {
            questions
          }
        })
          .then((data) => {
            if (!data) res.status(404).send();
            else { res.status(201).send(); }
          })
          .catch(e => {
            console.log(e);
            res.status(500).send();
          })
        ;
      }, loginType, req.headers.authorization, res);
    }
  }
};
