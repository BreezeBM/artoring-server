const { userModel } = require('../../model');
const { verifyJWTToken, sendEmail } = require('../tools');

module.exports = async (req, res) => {
  const { loginType: type } = req.body;

  if (type) {
    if (type === 'email') {
      const decode = await verifyJWTToken(req);

      switch (decode) {
        case 401: {
          res.staus(409).send();
          break;
        }
        case 403: {
          res.staus(409).send();
          break;
        }
        default: {
          try {
            const { email } = decode;

            const { data: userData } = await userModel.find({ email });

            sendEmail(userData, res);
          } catch (e) {
            console.log(e);
            if (e.type) { res.status(404).send(e.message); } else { res.status(500).send(e.message); }
          }
          break;
        }
      }
    } else {
      res.status(400).send();
    }
  } else {
    res.status(400).send();
  }
}
;
