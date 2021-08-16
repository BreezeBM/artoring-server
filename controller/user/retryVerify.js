const { userModel } = require('../../model');
const { verifyJWTToken, sendEmail } = require('../tools');

module.exports = async (req, res) => {
  const { accessToken: token } = req.body;

  req.headers.authorization = `Bearer ${token}`;
  try {
    const decode = await verifyJWTToken(req);

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

        const userData = await userModel.findOne({ _id });
        sendEmail(userData, res);

        break;
      }
    }
  } catch (e) {
    if (e.type) { res.status(404).send(e.message); } else { res.status(500).send(e.message); }
  }
}
;
