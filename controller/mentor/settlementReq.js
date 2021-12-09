// TODO
// post, 유저들(멘토들)이 정산을 요청한 경우 유저 확인 및 정산요청을 표시
// req.body = { proId?: programId, purId?: purchaseId }

import { userModel, mentoringModel, purchaseHistoryModel } from '../../model/index.js';
import { tool as tools, date } from '../tools/index.js';

export default (req, res) => {
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });

    return;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

  const { proId, purId, id } = req.body;

  if (!id || (!proId && !purId)) {
    res.status(200).json({ code: 404, message: 'need parameter' });
    return;
  }

  try {
    if (type === 'email') {
      const decode = tools.verifyJWTToken(req);

      switch (decode) {
        case 401: {
          res.status(200).json({ code: 401, message: 'not authorized' });
          break;
        }
        case 403: {
          res.status(200).json({ code: 403, message: 'need login' });
          break;
        }
        default: {
          userModel.findById(id)
            .then((data) => {
              if (!data.mentor.paymentInfo || !data.mentor.paymentInfo.bank) {
                res.status(200).json({ code: 400, message: 'post account info first' });
              } else {
                const pid = proId || purId;
                const model = proId !== undefined ? mentoringModel : purchaseHistoryModel;
                model.findByIdAndUpdate(pid, { $set: { settlementInfo: { progress: 0, createdAt: new Date(date().add(9, 'hours').format()) } } })
                  .then(() => {
                    res.status(200).send({ code: 201, message: 'ok' });
                  });
              }
            });
        }
      }
    } else {
      tools.verifyAndCallback(async () => {
        userModel.findById(id)
          .then((data) => {
            if (!data.mentor.paymentInfo || !data.mentor.paymentInfo.bank) {
              res.status(200).json({ code: 400, message: 'post account info first' });
            } else {
              const pid = proId || purId;
              const model = proId !== undefined ? mentoringModel : purchaseHistoryModel;

              model.findByIdAndUpdate(pid, { $set: { settlementInfo: { progress: 0, createdAt: new Date(date().add(9, 'hours').format()) } } })
                .then((data) => {
                  res.status(200).send({ code: 201, message: 'ok' });
                });
            }
          });
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
