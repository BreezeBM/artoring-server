const { userModel, mongoose } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

module.exports = async (req, res) => {
  const decode = await verifyJWTToken(req);

  if (!req.cookies.authorization) {
    res.status(401).send();
    return;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

  const { queryType, id, page } = req.query;
  if (type === 'email') {
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
        try {
          const { _id, name } = decode;
          // find().populate
          // const likeData = await userModel.findOne({ _id, name })
          //   .select({ queryType: 1, _id: 0 });
          // populate 메서드는 $lookup === SQL Left join 메서드

          // page와 로그인 타입만 명시된 요청  == 카드별 좋아요를 요청
          if (Object.keys(req.query).length === 2) {
            const result = {};
            const total = await userModel.findOne({ _id: mongoose.Types.ObjectId(_id), name })
              .select({ likedCareerEdu: 1, likedInfo: 1, likedMentor: 1 });
            for (const n of Object.keys(total._doc)) {
              if (Array.isArray(total._doc[n])) { result[n] = total._doc[n].length; }
            }
            res.status(200).json(result);
            return;
          } else {
            const aggregate = [
              { $match: { _id: mongoose.Types.ObjectId(_id) } },
              {
                $lookup: {
                }
              },
              { $skip: Math.pow((req.query.page - 1), queryType === 'info' ? 8 : 16) },
              { $limit: queryType === 'info' ? 8 : 16 },
              {
                $project: {
                  likedList: '$target'
                }
              }
            ];

            // 어그리게이션 수정
            const t = aggregate[1].$lookup;
            t.as = 'target';

            // 인풋에 따라 Join의 대상을 수정
            t.from = queryType === 'teach' || queryType === 'mentor' ? 'mentoringmodels' : 'careerinfomodels';

            // 멘토 정보 요청시 isGroup = false, 아니면 true 인것만 가져오기 위한 파이프라인.
            if (queryType === 'teach' || queryType === 'mentor') {
            // likedCareerEdu 에는 mentoring 카드의 좋아요 목록이 혼합되어 있음 배열을 변수로 선언
              t.let = { pid: '$likedCareerEdu' };
              t.pipeline = [
                {
                // 일치하는것만 가져옴
                  $match: {
                  // 다음 표현식에 따라
                    $expr: {
                    // 둘다 만족하는것
                      $and: [
                      // 집단/ 개인 멘토링 유무
                        { $eq: ['$isGroup', queryType !== 'mentor'] },
                        {
                        // 배열속 id와 from의 _id가 일치하는것만
                          $in: ['$_id', '$$pid']
                        }
                      ]
                    }
                  }
                }
              ];
            } else {
            // 일반 조인
              t.localField = 'likedInfo';
              t.foreignField = '_id';
            }

            const likedData = await userModel.aggregate(aggregate);
            res.status(200).json(likedData[0]);
          }
        } catch (err) {
          console.error(err);
          res.status(401).send({ message: 'AccessToken doesnt exist!' });
        }
      }
    }
  } else {
    verifyAndCallback(async () => {
      try {
        // if (Object.keys(req.query).length >= 2) {
        //   const result = {};
        //   const total = await userModel.findOne({ _id: mongoose.Types.ObjectId(id) })
        //     .select({ likedCareerEdu: 1, likedInfo: 1, likedMentor: 1 });

        //   console.log(total);
        //   for (const n of Object.keys(total._doc)) {
        //     if (Array.isArray(total._doc[n])) { result[n] = total._doc[n].length; }
        //   }
        //   res.status(200).json(result);

        //   return;
        // } else {
        // mongodb 어그리게이트 객체
        const aggregate = [
          { $match: { _id: mongoose.Types.ObjectId(id) } },
          {
            $lookup: {
            }
          },
          { $skip: Math.pow((req.query.page - 1), queryType === 'info' ? 8 : 16) },
          { $limit: queryType === 'info' ? 8 : 16 },
          {
            $project: {
              likedList: '$target'
            }
          }
        ];

        // 어그리게이션 수정
        const t = aggregate[1].$lookup;
        t.as = 'target';

        // 인풋에 따라 Join의 대상을 수정
        t.from = queryType === 'teach' || queryType === 'mentor' ? 'mentoringmodels' : 'careerinfomodels';

        // 멘토 정보 요청시 isGroup = false, 아니면 true 인것만 가져오기 위한 파이프라인.
        if (queryType === 'teach' || queryType === 'mentor') {
          // likedCareerEdu 에는 mentoring 카드의 좋아요 목록이 혼합되어 있음 배열을 변수로 선언
          t.let = { pid: queryType === 'teach' ? '$likedCareerEdu' : '$likedMentor' };
          t.pipeline = [
            {
              // 일치하는것만 가져옴
              $match: {
                // 다음 표현식에 따라
                $expr: {
                  // 둘다 만족하는것
                  $and: [
                    // 집단/ 개인 멘토링 유무
                    { $eq: ['$isGroup', queryType !== 'mentor'] },
                    {
                      // 배열속 id와 from의 _id가 일치하는것만
                      $in: ['$_id', '$$pid']
                    }
                  ]
                }
              }
            }
          ];
        } else {
          // 일반 조인
          t.localField = 'likedInfo';
          t.foreignField = '_id';
        }

        const likedData = await userModel.aggregate(aggregate);

        res.status(200).json(likedData[0]);
        // }
      } catch (err) {
        console.error(err);
        res.status(401).send({ message: 'AccessToken doesnt exist!' });
      }
    }, type, accessToken, res);
  }
};
