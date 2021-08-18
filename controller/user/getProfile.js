
const { userModel } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

module.exports = async (req, res) => {
  const accessToken = req.headers.authorization;

  const { type, id } = req.query;
  try {
    if (type === 'email') {
      const decode = await verifyJWTToken(req);

      switch (decode) {
        case 401: {
          res.staus(401).send();
          break;
        }
        case 403: {
          res.staus(403).send();
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
