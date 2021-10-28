
const { userModel } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

module.exports = async (req, res) => {
  const { profile } = req.body;

  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });
    return null;
  }

  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

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

        const data = await userModel.findOneAndUpdate({ _id, name }, req.body.profile);
        res.json(data);
      }
    }
  } else {
    verifyAndCallback(async () => {
      // 몽고디비 aggregate를 moogoose에서는 이런 메서드로도 지원해준다. 적용후 데이터를 볼수있도록 new: true설정이되어있다.
      await userModel.findOneAndUpdate({ _id: profile._id }, { $set: profile }, { new: true });

      res.send();
    }, type, accessToken, res);
  }
}
;
