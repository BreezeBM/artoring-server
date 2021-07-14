const { userModel } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {
  console.log(req.body);
  const { type } = req.body;

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
        console.log('decoded from put', decode);
        const { email, name } = decode;
        console.log(req.body);
        const data = await userModel.findOneAndUpdate({ email, name }, req.body.profile);
        res.json(data);
      }
    }
  }
}
;
