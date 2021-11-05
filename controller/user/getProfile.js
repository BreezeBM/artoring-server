
import { userModel } from '../../model/index.js';
import { tool } from '../tools/index.js'
// const { verifyJWTToken, verifyAndCallback } = require('../tools');

export default async (req, res) => {
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });

    return;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

  const { id } = req.query;
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
          const data = await userModel.findOne({ _id, name }).select({ pwd: 0 });
          res.json(data);
        }
      }
    } else {
      verifyAndCallback(async () => {
        const userInfo = await userModel.findOne({ _id: id }).select({ pwd: 0 });

        res.status(200).json(userInfo);
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
