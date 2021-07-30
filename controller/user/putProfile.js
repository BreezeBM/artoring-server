const { default: axios } = require('axios');
const { userModel } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

module.exports = async (req, res) => {
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
  } else {
    const accessToken = req.headers.authorization;
    verifyAndCallback(async (responseData) => {
      console.log(responseData.email, req.body);
      const data = await userModel.findOneAndUpdate({ email: responseData.email }, { $set: req.body.profile }, { new: true });
      console.log('data', data);
      res.send();
    }, type, accessToken, res);
  }
}
;
