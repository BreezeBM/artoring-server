require('dotenv').config();

const { userModel, reviewModel, careerInfoModel, mentoringModel, mongoose } = require('../../model');
const { verifyJWTToken, sha256Encrypt, date } = require('../tools');

const randWords = require('random-words');

module.exports = async (req, res) => {
  const { _id } = req.body;

  const randomWords = randWords({ min: 3, exactly: 24, join: ' ' });

  const isSocial = !req.cookies.authorization.includes('email');

  if (isSocial) res.redirect(307, '/drop/social');

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
        let userId;
        let likedCareerEdu;
        let likedMentor;
        let likedInfo;
        mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(_id) }, { $set: { isTerminated: true } })
          .then(() => userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, {
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
            userId = userData._id;
            likedCareerEdu = userData.likedCareerEdu;
            likedMentor = userData.likedMentor;
            likedInfo = userData.likedInfo;
            return reviewModel.updateMany({ userId: mongoose.Types.ObjectId(_id) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' })
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
            res.cookie('authorization', '', { expires: new Date(date().add(9, 'hours').format()) });
            res.status(200).send();
          })
          .catch(e => {
            console.log(e);
            res.status(500).send();
          });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
}
;
