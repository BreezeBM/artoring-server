
const { reviewModel } = require('../../model');
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
              const { id: _id, name } = decode;
              const { originType, targetId, text, rate } = req.body;

              const userData = await reviewModel.findOne({ _id, name });

              await reviewModel.create({
                userThumb: userData.thumb, userName: userData.name, originType, targetId, text, rate
              });
              res.send();
            } catch (e) {
              console.log(e);
              res.json(e.message);
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
