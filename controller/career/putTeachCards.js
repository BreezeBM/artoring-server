const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const { careerTeachCardModel } = require('../../model');
const { userModel } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {
  const { type } = req.body;
  console.log(type);
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
              const { email, name } = decode;
              const userData = await userModel.findOne({ email, name }).select({ _id: 1 });
              const {
                thumb,
                title,
                startDate,
                endDate,
                tag,
                maximumParticipants,
                availableTime,
                price
              } = req.body.postInfo;

              const purified = DOMPurify.sanitize(req.body.postInfo.dom);
              console.log(purified);
              const postingData = {
                thumb,
                title,
                startDate,
                endDate,
                tag,
                moderatorId: userData._id,
                detailInfo: purified,
                maximumParticipants,
                availableTime,
                price
              };

              await careerTeachCardModel.findOneAndUpdate({ _id: req.params.id, moderatorId: userData._id }, postingData);

              res.status(201).send();
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
