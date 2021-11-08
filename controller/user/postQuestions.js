import { purchaseHistoryModel, mongoose } from '../../model/index.js';
import { tool } from '../tools/index.js';
// const { verifyJWTToken, verifyAndCallback } = require('../tools');
export default async (req, res) => {
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });
    return null;
  }

  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const loginType = split[2];

  if (loginType) {
    if (loginType === 'email') {
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
      tool.verifyAndCallback(() => {
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
      }, loginType, accessToken, res);
    }
  }
};
