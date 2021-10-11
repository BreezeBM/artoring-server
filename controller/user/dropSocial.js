require('dotenv').config();

const { default: axios } = require('axios');
const { userModel, reviewModel, mentoringModel, mongoose, careerInfoModel } = require('../../model');
const { sha256Encrypt, verifyAndCallback } = require('../tools');

const randWords = require('random-words');

function base64decode (data) {
  while (data.length % 4 !== 0) {
    data += '=';
  }
  data = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(data, 'base64').toString('utf-8');
}
// 카카오 계정페이지 등에서 연결끊기를 누른경우에 실행됨.

module.exports = async (req, res) => {
  const { model } = req.params;

  const randomWords = randWords({ min: 3, exactly: 24, join: ' ' });

  // 클라이언트에서 회원탈퇴 요청이 들어온 경우
  if (req.body._id) {
    const split = req.cookies.authorization.split(' ');
    const accessToken = split[0].concat(' ', split[1]);

    if (!req.cookies.authorization) {
      res.status(401).send();
      return;
    }
    let userId;
    let likedCareerEdu;
    let likedMentor;
    let likedInfo;

    userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, {
      $set: {
        thumb: 'https://artoring.com/image/1626851218536.png',
        name: '탈퇴한 사용자입니다.',
        appId: '',
        nickName: '',
        email: sha256Encrypt(999, randomWords, Date.toString()),
        gender: '',
        birth: '',
        phone: '',
        address: '',
        pwd: '',
        major: '',
        current: {},
        interestedIn: [],
        isMentor: false,
        mentor: {
          name: '탈퇴한 사용자입니다.',
          descriptionText: null,
          likesCount: 0,
          price: 0,
          tags: [],
          descriptionForMentor: encodeURIComponent('<p>탈퇴한 사용자입니다</p>'),
          category: {
            employment: -1,
            founded: -1,
            professional: -1,
            free: -1,
            edu: -1
          },
          paymentInfo: ''
        }
      }
    })
      .then((userData) => {
        userId = userData._id;
        likedCareerEdu = userData.likedCareerEdu;
        likedMentor = userData.likedMentor;
        likedInfo = userData.likedInfo;

        verifyAndCallback((data, appSecret, proof) => {
          const url = userData.snsType === 'kakao'
            ? 'https://kapi.kakao.com/v1/user/unlink'
            : userData.snsType === 'naver'
              ? `https://nid.naver.com/oauth2.0/token?grant_type=delete&access_token=${accessToken}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`
              : `https://graph.facebook.com/v11.0/${userData.appId}/permissions?appsecret_proof=${proof}&access_token=${appSecret}`;

          const promise = userData.snsType !== 'facebook'
            ? userData.snsType === 'kakao'
                ? axios.get(url, {
                    headers: {
                      authorization: accessToken
                    }
                  })
                : axios.get(url)
            : axios.delete(url);

          // 멘토링 정보 삭제
          promise
            .then(response => {
              return mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(req.body._id) }, { $set: { isTerminated: true } });
            })
            .then(() => reviewModel.updateMany({ userId: mongoose.Types.ObjectId(req.body._id) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }))
            .then(() => reviewModel.find({ userId: mongoose.Types.ObjectId(req.body._id) }))
            .then(list => Promise.all(list.map(ele => mentoringModel.findOne({ _id: mongoose.Types.ObjectId(ele.targetId) }))))
            .then(list => Promise.all(list.map(ele => {
              let count = ele.rateCount;
              let rate = ele.rate * count;

              rate /= count--;

              return mentoringModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate } });
            })))
          // 멘토였던 사람의 경우 좋아요를 해둔 다른 사람들 정보까지 제거.
            .then(list => Promise.all(list.map(ele => userModel.findOneAndUpdate({ $or: [{ likedCareerEdu: { $in: [ele._id] } }, { likedMentor: { $in: [userId] } }] }, { $pull: { likedCareerEdu: ele._id, likedMentor: userId } }))))
            .then(() => {
              return Promise.all(likedCareerEdu.map(ele => mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $inc: { likesCount: -1 } })))
                .then(list => Promise.all(likedMentor.map(ele => userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $set: { mentor: { $inc: { likesCount: -1 } } } }))))
                .then(list => Promise.all(likedInfo.map(ele => careerInfoModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $inc: { likesCount: -1 } }))));
            })
            .then(() => {
              res.cookie('authorization', '', { expires: new Date(Date.now()) });
              res.status(200).send();
            }).catch(e => {
              console.log(e);
              res.status(500).send();
            });
        }, userData.snsType, accessToken, res);
      }).catch(e => {
        console.log(e);
        res.status(500).send();
      });
  } else {
    if (model === 'kakao') {
      const key = req.headers.authorization.split(' ')[1];
      if (key !== process.env.K_ADMIN || req.body.app_id !== process.env.K_ID) res.status(401).send();
      else {
        let userId;
        let likedCareerEdu;
        let likedMentor;
        let likedInfo;

        // 이사람이 좋아요 눌렀던것들을 취소하고 이사람을 좋아요한 사람들 리스트에서도 삭제해야 한다.
        userModel.findOne({ appId: req.body.user_id })
          .then(userData => {
            userId = userData._id;
            likedCareerEdu = userData.likedCareerEdu;
            likedMentor = userData.likedMentor;
            likedInfo = userData.likedInfo;

            return mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(userId) }, { $set: { isTerminated: true } })
            // 리뷰 내역 치환
              .then(() => reviewModel.updateMany({ userId: mongoose.Types.ObjectId(userId) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }))
              .then(() => reviewModel.find({ userId: mongoose.Types.ObjectId(userId) }))
            // 평점 되돌리기
              .then(list => Promise.all(list.map(ele => mentoringModel.findOne({ _id: mongoose.Types.ObjectId(ele.targetId) }))))
              .then(list => Promise.all(list.map(ele => {
                let count = ele.rateCount;
                let rate = ele.rate * count;

                rate /= count--;

                return mentoringModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate } });
              })))
            // 멘토였던 사람의 경우 좋아요를 해둔 다른 사람들 정보까지 제거.
              .then(list => Promise.all(list.map(ele => userModel.findOneAndUpdate({ $or: [{ likedCareerEdu: { $in: [ele._id] } }, { likedMentor: { $in: [userId] } }] }, { $pull: { likedCareerEdu: ele._id, likedMentor: userId } }))))
              .then(() => {
                return Promise.all(likedCareerEdu.map(ele => mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $inc: { likesCount: -1 } })))
                  .then(list => Promise.all(likedMentor.map(ele => userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $set: { mentor: { $inc: { likesCount: -1 } } } }))))
                  .then(list => Promise.all(likedInfo.map(ele => careerInfoModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $inc: { likesCount: -1 } }))));
              })
              .then(list => userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, {
                $set: {
                  thumb: 'https://artoring.com/image/1626851218536.png',
                  name: '탈퇴한 사용자입니다.',
                  appId: '',
                  nickName: '',
                  email: sha256Encrypt(999, randomWords, Date.toString()),
                  gender: '',
                  birth: '',
                  phone: '',
                  address: '',
                  pwd: '',
                  major: '',
                  current: {},
                  interestedIn: [],
                  isMentor: false,
                  mentor: {
                    name: '탈퇴한 사용자입니다.',
                    descriptionText: null,
                    likesCount: 0,
                    price: 0,
                    tags: [],
                    descriptionForMentor: encodeURIComponent('<p>탈퇴한 사용자입니다</p>'),
                    category: {
                      employment: -1,
                      founded: -1,
                      professional: -1,
                      free: -1,
                      edu: -1
                    },
                    paymentInfo: ''
                  }
                }
              }))
              .then(() => {
                res.cookie('authorization', '', { expires: new Date(Date.now()) });
                res.status(200).send();
              })
              .catch(e => {
                console.log(e);
                res.status(500).send();
              });
          });
      }
    } else {
      // 네이버는 연동해지 알림 서비스가 없다.
      const [signedHeader, signedPayload] = req.body.signed_request.split('.', 2);
      let userId;
      let likedCareerEdu;
      let likedMentor;
      let likedInfo;

      const promise = Promise.resolve(
        sha256Encrypt(999, signedPayload, process.env.FACEBOOK_SEC, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', ''));

      promise
        .then(expectedToken => {
          if (expectedToken !== signedHeader) throw new Error('token mismatch');

          const { user_id: appId } = base64decode(signedPayload);
          userId = appId;

          return userModel.findOne({ appId });
        })
        .then(userData => {
          userId = userData._id;
          likedCareerEdu = userData.likedCareerEdu;
          likedMentor = userData.likedMentor;
          likedInfo = userData.likedInfo;
          return mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(userId) }, { $set: { isTerminated: true } });
        })
        .then(() => userModel.findOneAndUpdate({ userId: mongoose.Types.ObjectId(userId) }, {
          $set: {
            thumb: 'https://artoring.com/image/1626851218536.png',
            name: '탈퇴한 사용자입니다.',
            appId: '',
            nickName: '',
            email: sha256Encrypt(999, randomWords, Date.toString()),
            gender: '',
            birth: '',
            phone: '',
            address: '',
            pwd: '',
            major: '',
            current: {},
            interestedIn: [],
            isMentor: false,
            mentor: {
              name: '탈퇴한 사용자입니다.',
              descriptionText: null,
              likesCount: 0,
              price: 0,
              tags: [],
              descriptionForMentor: encodeURIComponent('<p>탈퇴한 사용자입니다</p>'),
              category: {
                employment: -1,
                founded: -1,
                professional: -1,
                free: -1,
                edu: -1
              },
              paymentInfo: ''
            }
          }
        }))
        .then((userData) => {
          return reviewModel.updateMany({ userId: mongoose.Types.ObjectId(userId) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }, { new: true })
          ;
        })
        .then(() => reviewModel.find({ userId: mongoose.Types.ObjectId(userId) }))
        .then(list => Promise.all(list.map(ele => mentoringModel.findOne({ _id: mongoose.Types.ObjectId(ele.targetId) }))))
        .then(list => Promise.all(list.map(ele => {
          let count = ele.rateCount;
          let rate = ele.rate * count;

          rate /= count--;

          return mentoringModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate } });
        })))
      // 멘토였던 사람의 경우 좋아요를 해둔 다른 사람들 정보까지 제거.
        .then(list => Promise.all(list.map(ele => userModel.findOneAndUpdate({ $or: [{ likedCareerEdu: { $in: [ele._id] } }, { likedMentor: { $in: [userId] } }] }, { $pull: { likedCareerEdu: ele._id, likedMentor: userId } }))))
        .then(() => {
          return Promise.all(likedCareerEdu.map(ele => mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $inc: { likesCount: -1 } })))
            .then(list => Promise.all(likedMentor.map(ele => userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $set: { mentor: { $inc: { likesCount: -1 } } } }))))
            .then(list => Promise.all(likedInfo.map(ele => careerInfoModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { $inc: { likesCount: -1 } }))));
        })
        .then(() => {
          res.cookie('authorization', '', { expires: new Date(Date.now()) });
          res.status(200).json({ url: `https://artoring.com/drop/facebook?id=${userId}`, confirmation_code: `${userId}Deleted!` });
        })
        .catch(e => {
          console.log(e);
          res.status(500).send();
        });
    }
  }
}
;
