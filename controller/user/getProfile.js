
const { userModel } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {
  const { type, review } = req.query;

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
        console.log('decoded form get', decode);
        const { email, name } = decode;
        const data = await userModel.findOne({ email, name }).select({ pwd: 0 });
        res.json(data);
      }
    }
  }
}
;
