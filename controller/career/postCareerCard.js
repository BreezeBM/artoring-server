const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const { verifyJWTToken, AdminAccessException, aesDecrypt } = require(
  "../tools",
);
const { mentoringModel, adminModel } = require("../../model");

const window = new JSDOM().window;
const DOMPurify = createDOMPurify(window);

module.exports = async (req, res) => {
  try {
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
        const {
          _id,
          thumb,
          title,
          startDate,
          endDate,
          moderatorId,
          tags,
          detailInfo,
          textDetailInfo,
          isGroup,
          availableTime,
          maximumParticipants,
          price,
        } = req.body.cardData;
        const { name, accessKey, authLevel } = decode;
        if (authLevel === 0) return res.send(403);

        if (!accessKey) throw new AdminAccessException("need authorize");

        const accKey = await aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new AdminAccessException("no match found");

        const purifiedDetailInfo = DOMPurify.sanitize(
          decodeURIComponent(detailInfo),
        );

        const postCardData = {
          thumb,
          title,
          startDate,
          endDate,
          moderatorId,
          tags,
          detailInfo: purifiedDetailInfo,
          textDetailInfo,
          isGroup,
          availableTime,
          maximumParticipants,
          price,
        };

        const careerCardData = await mentoringModel.findOne({ _id });
        if (!careerCardData) {
          await mentoringModel.create(postCardData);
          return res.send(201);
        } else {
          await mentoringModel.findOneAndUpdate({ _id }, {
            $set: postCardData,
          });
          return res.send(200);
        }
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
};
