import dotenv from 'dotenv';

import { userModel, reviewModel, careerInfoModel, mentoringModel, mongoose } from '../../model/index.js';
import { tool, date } from '../tools/index.js';
// const { verifyJWTToken, verifyAndCallback, sha256Encrypt, date } = require('../tools');

import randWords from 'random-words';
dotenv.config();

export default async (req, res) => {
  const { _id, reason } = req.body;

  const randomWords = randWords({ min: 3, exactly: 24, join: ' ' });

  const userData = await userModel.findById(mongoose.Types.ObjectId(_id));

  if (userData.isMentor === true && userData.isDrop !== 1) {
    userModel.findByIdAndUpdate(mongoose.Types.ObjectId(_id), {
      $set: {
        isDrop: 0,
        'drop.reason': reason
      // email: tool.sha256Encrypt(999, randomWords, Date.toString())
      }
    })
      .then(() => {
        res.status(200).json({ code: 403, message: 'mentor needs authorization by admins' });
      });

    return;
  }

  let isSocial = false;

  // 이메일로 가입하고 소셜 로그인을 연동한 경우
  if (userData.sns.length > 0) { isSocial = true; }

  if (isSocial) {
    const sns = userData.sns;
    // 연동 해제용 인증 코드 요청 데이터.
    res.status(200).json({ code: 400, sns });
    return;
  }

  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });
    return null;
  }

  if (!req.cookies.authorization.includes('email')) {
    const [Bearer, token, snsType] = req.cookies.authorization.split(' ');

    tool.verifyAndCallback(() => {
      dropUser();
    }, snsType, Bearer.concat(' ', token), res);
  } else {
    dropUser();
  }

  async function dropUser () {
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
          let userId;
          let likedCareerEdu;
          let likedMentor;
          let likedInfo;

          mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(_id) }, { $set: { isTerminated: true } })
            .then(() => userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, {
              $set: {
                thumb: 'https://artoring.com/image/1626851218536.png',
                appId: '',
                nickName: '',
                email: tool.sha256Encrypt(999, randomWords, Date.toString()),
                gender: '',
                birth: '',
                phone: '',
                address: '',
                pwd: '',
                major: '',
                current: {},
                interestedIn: [],
                isMentor: false,
                isDrop: 1,
                'mentor.likesCount': 0,
                'mentor.price': 0,
                'mentor.category.free': -1,
                'mentor.category.employment': -1,
                'mentor.category.founded': -1,
                'mentor.category.professional': -1,
                'mentor.category.edu': -1,
                'mentor.paymentInfo': ''
              }
            }))
            .then((userData) => {
              userId = userData._id;
              likedCareerEdu = userData.likedCareerEdu;
              likedMentor = userData.likedMentor;
              likedInfo = userData.likedInfo;

              return userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(userId) }, {
                $set: {
                  drop: {
                    reason,
                    name: userData.name,
                    date: new Date(date().add(9, 'hours').format())
                  }
                }
              })
                .then(() => reviewModel.updateMany({ userId: mongoose.Types.ObjectId(_id) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }))

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
}
;
