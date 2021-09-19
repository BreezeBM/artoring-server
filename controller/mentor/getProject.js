const { purchaseHistoryModel, mentoringModel, mongoose } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

// 멘토 개인페이지, 프로젝트 리스트 및 그 참여명단 처리 핸들러
module.exports = async (req, res) => {
  const { userId, programId, size } = req.query;
  const page = Number(req.query.page);

  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

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
          // 멘토의 프로그램 리스트 요청. 멘토의 _id를 바탕으로 전달.
          if (userId) {
            // 필수 정보 없으면 400 에러 리턴
            if (userId === '' || !page || page === '') res.status(400).send();
            else {
              // 어그리게이트로 진행자가 멘토인 것들을 찾아서 리턴.
              mentoringModel.aggregate([
                { $match: { moderatorId: mongoose.Types.ObjectId(userId) } },
                { $sort: { createdAt: 1 } },
                {
                  $facet: {
                    cardList: [{ $skip: (page - 1) * (size || 10) }, { $limit: size || 10 }],
                    total: [{ $count: 'count' }]
                  }
                }
              ])
                .then(data => {
                  res.status(200).json(data[0]);
                })
                .catch(e => {
                  console.log(e);
                  res.status(500).send(e.message);
                });
            }
          } else {
            // 프로그램 참여자 리스트 리턴.
            if (programId === '' || !page || page === '') res.status(400).send();
            else {
              purchaseHistoryModel.aggregate([
                { $match: { targetId: mongoose.Types.ObjectId(programId) } },
                // 해당되는 유저를 조인하여
                { $lookup: { from: 'usermodels', as: 'users', localField: 'userId', foreignField: '_id' } },
                // { $unwind: '$users' },
                // 해당 포멧으로 리턴함.
                {
                  $project: {
                    zoomLike: '$zoomLink',
                    bookedStartTime: '$bookedStartTime',
                    bookedEndTime: '$bookedEndTime',
                    createdAt: '$createdAt',
                    userThumb: '$users.thumb',
                    userName: '$users.name',
                    major: '$users.major',
                    current: '$users.current',
                    interestedIn: '$users.interestedIn',
                    questions: '$questions'
                  }
                },
                // 페이지 네이션에 필요한 데이터 및 토탈 카운트 리턴.
                {
                  $facet: {
                    cardList: [{ $skip: (page - 1) * (size || 10) }, { $limit: size || 10 }],
                    total: [{ $count: 'count' }]
                  }
                }
              ])
                .then(list => {
                  res.status(200).json(list[0]);
                });
            }
          }
        }
      }
    } else {
      verifyAndCallback(async () => {
        if (userId) {
          // 필수 정보 없으면 400 에러 리턴
          if (userId === '' || !page || page === '') res.status(400).send();
          else {
            // 어그리게이트로 진행자가 멘토인 것들을 찾아서 리턴.
            mentoringModel.aggregate([
              { $match: { moderatorId: mongoose.Types.ObjectId(userId) } },
              {
                $facet: {
                  cardList: [{ $skip: (page - 1) * (size || 10) }, { $limit: size || 10 }],
                  total: [{ $count: 'count' }]
                }
              }
            ])
              .then(data => {
                res.status(200).json(data[0]);
              })
              .catch(e => {
                console.log(e);
                res.status(500).send(e.message);
              });
          }
        } else {
          // 프로그램 참여자 리스트 리턴.
          if (programId === '' || !page || page === '') res.status(400).send();
          else {
            purchaseHistoryModel.aggregate([
              { $match: { targetId: mongoose.Types.ObjectId(programId) } },
              // 해당되는 유저를 조인하여
              { $lookup: { from: 'usermodels', as: 'users', localField: 'userId', foreignField: '_id' } },
              { $unwind: '$users' },
              // 해당 포멧으로 리턴함.
              {
                $project: {
                  zoomLike: '$zoomLink',
                  bookedStartTime: '$bookedStartTime',
                  bookedEndTime: '$bookedEndTime',
                  createdAt: '$createdAt',
                  userThumb: '$user.thumb',
                  userName: '$user.name',
                  major: '$user.major',
                  current: '$user.current',
                  interestedIn: '$user.interestedIn',
                  questions: '$questions'
                }
              },
              // 페이지 네이션에 필요한 데이터 및 토탈 카운트 리턴.
              {
                $facet: {
                  cardList: [{ $skip: (page - 1) * (size || 10) }, { $limit: size || 10 }],
                  total: [{ $count: 'count' }]
                }
              }
            ])
              .then(list => {
                res.status(200).json(list[0]);
              });
          }
        }
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
}
;
