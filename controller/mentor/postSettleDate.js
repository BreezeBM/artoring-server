// TODO 클라이언트에서 멘토 관련 정보요청 및 정보수정 핸들러

import { userModel } from '../../model/index.js';
import { tool as tools } from '../tools/index.js';

export default async (req, res) => {
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });

    return;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

  try {
    if (type === 'email') {
      const decode = await tools.verifyJWTToken(req);

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
          if (!req.body.bankInfo) {
            userModel.findOne({ _id, name })
              .then((mentorData) => {
                if (!mentorData) {
                  res.status(200).send({ code: 404, message: 'not found' });
                } else {
                  res.status(200).send({ code: 200, message: 'ok', data: { account: mentorData.mentor.paymentInfo, settledAmount: mentorData.mentor.settledAmount } });
                }
              });
          } else {
            userModel.findByIdAndUpdate(req.body._id, { $set: { 'mentor.paymentInfo': req.body.bankInfo } })
              .then(() => res.status(200).json({ code: 201, message: 'ok' }));
          }
        }
      }
    } else {
      tools.verifyAndCallback(async () => {
        if (!req.body.bankInfo) {
          userModel.findById(req.body._id)
            .then((mentorData) => {
              if (!mentorData) {
                res.status(200).send({ code: 404, message: 'not found' });
              } else {
                res.status(200).send({ code: 201, message: 'ok', data: { account: mentorData.mentor.paymentInfo, settledAmount: mentorData.mentor.settledAmount } });
              }
            });
        } else {
          userModel.findByIdAndUpdate(req.body._id, { $set: { 'mentor.paymentInfo': req.body.bankInfo } })
            .then(() => res.status(200).json({ code: 201, message: 'ok' }));
        }
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
