import createDOMPurify from 'dompurify';
import jsdom from 'jsdom';
// const createDOMPurify = require('dompurify');
// const { JSDOM } = require('jsdom');

import { tool, seo, date } from '../tools/index.js';
// const { verifyJWTToken, AdminAccessException, aesDecrypt, createSeo } = require(
//   '../tools'
// );
import { mentoringModel, careerInfoModel, adminModel, mongoose, purchaseHistoryModel } from '../../model/index.js';

const window = new jsdom.JSDOM().window;
const DOMPurify = createDOMPurify(window);

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const src = node.getAttribute('src') || '';
    if (!src.startsWith('https://www.youtube.com/embed/')) {
      return node.parentNode.removeChild(node);
    }
  }
});

export default async (req, res) => {
  try {
    const decode = await tool.verifyJWTToken(req);
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

        if (!accessKey) throw new tool.AdminAccessException('need authorize');

        const accKey = await tool.aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new tool.AdminAccessException('no match found');

        const purifiedDetailInfo = DOMPurify.sanitize(
          decodeURIComponent(detailInfo), {
            ADD_TAGS: ['iframe'], // or ALLOWED_TAGS
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] // or //or ALLOWED_ATR
          });

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
        // isGoup == undefined => 커리어 인포, 아니면 멘토링 프로그램
        const targetModel = isGroup !== undefined ? mentoringModel : careerInfoModel;

        // 타겟 모델에 따라 올려야할 html 주소가 다름
        const url = targetModel === mentoringModel
          ? `/static/html/career/growing/${isGroup ? 'teach' : 'mentor'}/${_id}/index.html`
          : `/static/html/career/info/${_id}/index.html`;

        const objData = [
          { key: 'og:url', value: `https://artoring.com/career/growing/${isGroup ? 'teach' : 'mentor'}/${_id}`, isProperty: true },
          { key: 'og:title', value: '아토링', isProperty: true },
          { key: 'og:description', value: '아토링은 청년 예술인을 위한 문화예술계 커리어 문제해결 플랫폼입니다.', isProperty: true },
          { key: 'og:locale', value: 'ko_KR', isProperty: true },
          { key: 'og:type', value: 'website', isProperty: true },
          { key: 'og:image', value: 'http://artoring.com/image/openGraphImg.png', isProperty: true },
          { key: 'og:image:secure_url', value: 'https://artoring.com/image/openGraphImg.png', isProperty: true },
          { key: 'fb:app_id', value: '290939452791975', isProperty: true },
          { key: 'og:image:width', value: '1200px', isProperty: true },
          { key: 'og:image:height', value: '600px', isProperty: true }
        ];

        seo.createSeo(url, objData)
          .then(() => {
            if (_id) {
              targetModel.findOne({ _id: mongoose.Types.ObjectId(_id) })
                .then(careerCardData => {
                  if (!careerCardData) {
                    targetModel.create(postCardData)
                      .then(() => {
                        return res.send(201);
                      });
                  } else {
                    targetModel.findOneAndUpdate({ _id }, {
                      $set: { ...postCardData, updatedAt: new Date(date().add(9, 'hours').format()) }
                    }, { new: true })
                      .then((cardData) => {
                        return purchaseHistoryModel.find({ targetId: _id, bookedStartTime: { $lte: cardData.startDate } })
                          .then(list => {
                            Promise.all(list.map(ele => {
                              return purchaseHistoryModel.findOneAndUpdate({ _id: ele._id }, {
                                $set: {
                                  bookedStartTime: cardData.startDate,
                                  bookedEndTime: cardData.endDate
                                }
                              });
                            }));
                          })
                          .then(() => {
                            return res.sendStatus(200);
                          });
                      });
                  }
                });
            } else {
              targetModel.create(postCardData)
                .then(() => {
                  return res.send(201);
                });
            }
          });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
};
