const { careerTeachCardModel } = require('../../model');
const { userModel } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {
  const { type } = req.body;

  if (type) {
    switch (type) {
      case 'naver': {
        break;
      }
      case 'kakao': {
        break;
      }
      case 'facebook': {
        break;
      }
      default: {
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
            try {
              const { id } = req.params;
              const { email, name } = decode;

              const userData = await userModel.findOne({ email, name }).select({ _id: 1 });
              await careerTeachCardModel.findOneAndDelete({ _id: id, moderatorId: userData._id });

              res.status(204).send();
            } catch (e) {
              res.status(500).send(e.message);
            }
            break;
          }
        }
        break;
      }
    }
  }
}
;
