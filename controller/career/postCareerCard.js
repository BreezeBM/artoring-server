const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const { verifyJWTToken, AdminAccessException, aesDecrypt } = require(
  '../tools'
);
const { mentoringModel, careerInfoModel, adminModel, mongoose } = require('../../model');

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
          issuedDate,
          createrName
        } = req.body.cardData;
        const { name, accessKey, authLevel } = decode;
        if (authLevel === 0) return res.send(403);

        if (!accessKey) throw new AdminAccessException('need authorize');

        const accKey = await aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new AdminAccessException('no match found');

        const purifiedDetailInfo = DOMPurify.sanitize(
          decodeURIComponent(detailInfo)
        );

        const postCardData = {
          thumb,
          title,
          startDate,
          endDate,
          moderatorId,
          tags,
          detailInfo: encodeURIComponent(purifiedDetailInfo),
          textDetailInfo,
          isGroup,
          availableTime,
          maximumParticipants,
          price,
          issuedDate,
          createrName
        };
        const targetModel = isGroup !== undefined ? mentoringModel : careerInfoModel;
        if (_id) {
          const careerCardData = await targetModel.findOne({ _id: mongoose.Types.ObjectId(_id) });

          if (!careerCardData) {
            await targetModel.create(postCardData);
            return res.send(201);
          } else {
            const t = await targetModel.findOneAndUpdate({ _id }, {
              $set: postCardData
            }, { new: true });

            console.log(t);
            return res.send(200);
          }
        } else {
          await targetModel.create(postCardData);
          return res.send(201);
        }
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
};
