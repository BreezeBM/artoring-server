const { purchaseHistoryModel, mentoringModel, mongoose } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

module.exports = async (req, res) => {
  const { loginType: type, id } = req.body;
  const { accessToken } = req.headers.authorization;

  try {
    if (type === 'email') {
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
          const { _id: userId, name } = decode;

          console.log(userId, req.query);
          const targetData = await purchaseHistoryModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
              $lookup: {
                from: 'mentoringmodels',
                as: 'mentoring',
                let: { targetId: '$targetId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$isGroup', true] },
                          {
                            $eq: ['$_id', '$$targetId']
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            },
            {
              $project: {
                title: '$mentoring.title',
                price: '$mentoring.price',
                thumb: '$mentoring.thumb',
                startDate: '$bookedStartTime',
                endDate: '$bookedEndTime',
                tags: '$mentoring.tags',
                inprogress: '$inprogress'

              }
            },
            {
              $sort: {
                startDate: -1
              }
            }, {
              $skip: (req.query.page - 1) * 8
            }, {
              $limit: 8
            }
          ]);

          res.status(200).json(targetData);
        }
      }
    } else {
      verifyAndCallback(async () => {
        // const targetData = await purchaseHistoryModel.findOne(query, null, queryOption).select({ zoomLink: 0, cratedAt: 0 });
        const targetData = await purchaseHistoryModel.aggregate([
          { $match: { userId: mongoose.Types.ObjectId(id) } },
          {
            $lookup: {
              from: 'mentoringmodels',
              localField: 'targetId',
              foreignField: '_id',
              as: 'mentoring'
            }
          },
          {
            $project: {
              title: '$mentoring.title',
              price: '$mentoring.price',
              thumb: '$mentoring.thumb',
              startDate: '$bookedStartTime',
              endDate: '$bookedEndTime',
              tags: '$mentoring.tags',
              inprogress: '$inprogress',
              isGroup: {
                $filter: req.query.purchasedType === 'teaching'
              }
            }
          },
          {
            $sort: {
              startDate: -1
            }
          }, {
            $skip: (req.query.page - 1) * 8
          }, {
            $limit: 8
          }
        ]);

        res.status(200).json(targetData);
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
