import { userModel, mongoose } from '../../model/index.js';
import { tool, sendGmail } from '../tools/index.js';
// const { verifyJWTToken, sendGmail } = require('../tools');

export default async (req, res) => {
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });
    return null;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  try {
    const decode = await tool.verifyJWTToken(req);

    switch (decode) {
      case 401: {
        res.status(409).send();
        break;
      }
      case 403: {
        res.status(409).send();
        break;
      }
      default: {
        const { _id } = decode;

        userModel.findOne({ _id: mongoose.Types.ObjectId(_id) })
          .then(async userData => {
            await sendGmail({ userData, accessToken }, userData.email, res);
          });

        break;
      }
    }
  } catch (e) {
    if (e.type) { res.status(404).send(e.message); } else { res.status(500).send(e.message); }
  }
}
;
