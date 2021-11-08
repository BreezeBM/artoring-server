import { purchaseHistoryModel, mongoose } from '../../model/index.js';
import { tool } from '../tools/index.js';
// const { verifyJWTToken, verifyAndCallback } = require('../tools');

export default async (req, res) => {
  const { id, page, size } = req.query;
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });
    return;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

  try {
    if (type === 'email') {
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
          const { _id: userId } = decode;

          // 특정 결제내역 요청
          if (req.params.id) {
            const targetData = await purchaseHistoryModel.aggregate([
              // 구매내역에서 해당되는 유저들의 문서들만 골라서
              { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
              // 룩업으로 멘터링 모델을 조인하는데
              {
                $lookup: {
                  from: 'mentoringmodels',
                  as: 'mentoring',
                  // purchaseHistory의 targetId를 변수를 지정한
                  let: { targetId: '$targetId', isGroup: req.query.isGroup },
                  // 파이프라인을 이용해서 targetId 변수와 멘터링 문서의 _id가 일치하며 isGroup이 purchasedType과 일치하는 문서들만 추출
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$targetId']
                        }
                      }
                    }
                  ]
                }
              },
              { $unwind: '$mentoring' },
              // 아래와 같은 형식으로 배열 내부 요소로 집어넣는다
              {
                $project: {
                  title: '$mentoring.title',
                  price: '$mentoring.price',
                  thumb: '$mentoring.thumb',
                  startDate: '$bookedStartTime',
                  endDate: '$bookedEndTime',
                  tags: '$mentoring.tags',
                  progress: '$progress',
                  targetId: '$mentoring._id',
                  isReviewed: '$isReviewed',
                  questions: '$questions',
                  isGroup: '$mentoring.isGroup',
                  merchantUid: '$merchantUid'
                }
              }
            ]);

            res.status(200).json({ code: null, reservationData: targetData[0] });
          } else {
            // 몽고디비 aggregation 파이프라인
            try {
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
                              { $eq: ['$_id', '$$targetId'] },
                              { $eq: ['$isGroup', req.query.isGroup === 'true'] }
                            ]
                          }
                        }
                      }
                    ]
                  }
                },
                // 아래와 같은 형식으로 배열 내부 요소로 집어넣는다
                { $unwind: '$mentoring' },
                {
                  $project: {
                    title: '$mentoring.title',
                    price: '$mentoring.price',
                    thumb: '$mentoring.thumb',
                    startDate: '$bookedStartTime',
                    endDate: '$bookedEndTime',
                    tags: '$mentoring.tags',
                    progress: '$progress',
                    targetId: '$mentoring._id',
                    isReviewed: '$isReviewed',
                    questions: '$questions',
                    isGroup: '$mentoring.isGroup'
                  }
                },
                // 최신순으로 내침차순으로 정렬해서
                {
                  $sort: {
                    startDate: -1
                  }
                  // 필요한 양 만큼의 데이터만 추출
                }, {
                  $facet: {
                    cardList: [{ $skip: (page - 1) }, { $limit: Number(size) || 16 }],
                    count: [
                      {
                        $count: 'count'
                      }
                    ]
                  }
                }
              ]);

              res.status(200).json(targetData[0]);
            } catch (e) {
              res.status(400).send();
              return null;
            }
          }
        }
      }
    } else {
      tool.verifyAndCallback(async () => {
        if (req.params.id) {
          try {
            const targetData = await purchaseHistoryModel.aggregate([
            // 구매내역에서 해당되는 유저들의 문서들만 골라서
              { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
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
                          $eq: ['$_id', '$$targetId']
                        }
                      }
                    }
                  ]
                }
              },
              { $unwind: '$mentoring' },
              // 아래와 같은 형식으로 배열 내부 요소로 집어넣는다
              {
                $project: {
                  title: '$mentoring.title',
                  price: '$mentoring.price',
                  thumb: '$mentoring.thumb',
                  startDate: '$bookedStartTime',
                  endDate: '$bookedEndTime',
                  tags: '$mentoring.tags',
                  progress: '$progress',
                  targetId: '$mentoring._id',
                  isReviewed: '$isReviewed',
                  questions: '$questions',
                  isGroup: '$mentoring.isGroup',
                  merchantUid: '$merchantUid'
                }
              }
            ]);

            res.status(200).json({ code: null, reservationData: targetData[0] });
          } catch (e) {
            res.status(400).send();
            return null;
          }
        } else {
          // const targetData = await purchaseHistoryModel.findOne(query, null, queryOption).select({ zoomLink: 0, cratedAt: 0 });
          purchaseHistoryModel.aggregate([
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
                          { $eq: ['$_id', '$$targetId'] },
                          { $eq: ['$isGroup', req.query.isGroup === 'true'] }
                        ]
                      }
                    }
                  }
                ]
              }
            },
            { $unwind: '$mentoring' },
            {
              $project: {
                title: '$mentoring.title',
                price: '$mentoring.price',
                thumb: '$mentoring.thumb',
                startDate: '$bookedStartTime',
                endDate: '$bookedEndTime',
                tags: '$mentoring.tags',
                progress: '$progress',
                targetId: '$mentoring._id',
                isReviewed: '$isReviewed',
                questions: '$questions',
                isGroup: '$mentoring.isGroup'
              }
            },

            {
            // 페이지네이션 카드 정보 및  카드 수 리턴
              $facet: {
                cardList: [{ $skip: (req.query.page - 1) * (req.query.size || 16) }, { $limit: Number(req.query.size) || 16 }],
                count: [
                  {
                    $count: 'count'
                  }
                ]

              }
            }
          ])
            .then(targetData => {
            // targetData.map(index => {
            //   index = index.flat();
            //   return index;
            // });

              res.status(200).json(targetData[0]);
            })
            .catch(e => {
              console.log(e);
              throw e;
            });
        }
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
