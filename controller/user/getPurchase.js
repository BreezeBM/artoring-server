const { purchaseHistoryModel, mentoringModel, mongoose } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

module.exports = async (req, res) => {
  const { loginType: type, id, page, purchasedType = true } = req.query;
  const accessToken = req.headers.authorization;

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
          const { _id: userId } = decode;

          console.log(userId, req.query);

          // 몽고디비 aggregation 파이프라인
          const targetData = await purchaseHistoryModel.aggregate([
            // 구매내역에서 해당되는 유저들의 문서들만 골라서
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            // 룩업으로 멘터링 모델을 조인하는데
            {
              $lookup: {
                from: 'mentoringmodels',
                as: 'mentoring',
                // purchaseHistory의 targetId를 변수를 지정한
                let: { targetId: '$targetId' },
                // 파이프라인을 이용해서 targetId 변수와 멘터링 문서의 _id가 일치하며 isGroup이 purchasedType과 일치하는 문서들만 추출
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$isGroup', purchasedType] },
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
            // 아래와 같은 형식으로 배열 내부 요소로 집어넣는다
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
            // 최신순으로 내침차순으로 정렬해서
            {
              $sort: {
                startDate: -1
              }
              // 필요한 양 만큼의 데이터만 추출
            }, {
              $skip: page ? (page - 1) * 8 : 0
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
              as: 'mentoring',
              let: { targetId: '$targetId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$isGroup', purchasedType] },
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
            $skip: page ? (page - 1) * 8 : 0
          }, {
            $limit: 8
          }
        ]);
        targetData.map(index => {
          index.tags = index.tags.flat();
          return index;
        });
        res.status(200).json(targetData);
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
