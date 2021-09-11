require('dotenv').config();

const { default: axios } = require('axios');
const { userModel, reviewModel, mentorModel, mentoringModel, mongoose } = require('../../model');
const { sha256Encrypt, verifyAndCallback } = require('../tools');

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

  // 클라이언트에서 회원탈퇴 요청이 들어온 경우
  if (req.body._id) {
    if (!req.headers.authorization) {
      res.status(401).send();
      return;
    }

    userModel.findOne({ _id: mongoose.Types.ObjectId(req.body._id) })
      .then((userData) => {
        verifyAndCallback((data, appSecret, proof) => {
          const url = userData.snsType === 'kakao'
            ? 'https://kapi.kakao.com/v1/user/unlink'
            : userData.snsType === 'naver'
              ? `https://nid.naver.com/oauth2.0/token?grant_type=delete&access_token=${req.headers.authorization}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`
              : `https://graph.facebook.com/v11.0/${userData.appId}/permissions?appsecret_proof=${proof}&access_token=${appSecret}`;

          const promise = userData.snsType !== 'facebook'
            ? userData.snsType === 'kakao'
                ? axios.get(url, {
                    headers: {
                      authorization: req.headers.authorization
                    }
                  })
                : axios.get(url)
            : axios.delete(url);
          promise
            .then(response => {
              return mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(req.body._id) }, { $set: { isTerminated: true } });
            })
            .then(() => mentorModel.findOneAndUpdate({ userId: mongoose.Types.ObjectId(req.body._id) }, { $set: { name: '탈퇴한 사용자입니다.', descriptionText: null, likesCount: 0, price: 0, tags: [], descriptionForMentor: encodeURIComponent('<p>탈퇴한 사용자입니다</p>') } }))
            .then(() => reviewModel.updateMany({ userId: mongoose.Types.ObjectId(req.body._id) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }))
            .then(() => reviewModel.find({ userId: mongoose.Types.ObjectId(req.body._id) }))
            .then(list => Promise.all(list.map(ele => mentoringModel.findOne({ _id: mongoose.Types.ObjectId(ele.targetId) }))))
            .then(list => Promise.all(list.map(ele => {
              let count = ele.rateCount;
              let rate = ele.rate * count;

              rate /= count--;

              return mentorModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate } });
            })))
            .then(list => userModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.body._id) }))
            .then(() => {
              res.status(200).send();
            }).catch(e => {
              console.log(e);
              res.status(500).send();
            });
        }, userData.snsType, req.headers.authorization, res);
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
        userModel.findOne({ appId: req.body.user_id })
          .then(userData => {
            userId = userData._id;
            return mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(userId) }, { $set: { isTerminated: true } })
              .then(() => mentorModel.findOneAndUpdate({ userId: mongoose.Types.ObjectId(userId) }, { $set: { name: '탈퇴한 사용자입니다.', descriptionText: null, likesCount: 0, price: 0, tags: [], descriptionForMentor: encodeURIComponent('<p>탈퇴한 사용자입니다</p>') } }))
              .then(() => reviewModel.updateMany({ userId: mongoose.Types.ObjectId(userId) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }))
              .then(() => reviewModel.find({ userId: mongoose.Types.ObjectId(userId) }))
              .then(list => Promise.all(list.map(ele => mentoringModel.findOne({ _id: mongoose.Types.ObjectId(ele.targetId) }))))
              .then(list => Promise.all(list.map(ele => {
                let count = ele.rateCount;
                let rate = ele.rate * count;

                rate /= count--;

                return mentorModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate } });
              })))
              .then(list => userModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(userId) }))
              .then(() => {
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
      sha256Encrypt(999, signedPayload, process.env.FACEBOOK_SEC, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', '')
        .then(expectedToken => {
          if (expectedToken !== signedHeader) throw new Error('token mismatch');

          const { user_id: appId } = base64decode(signedPayload);
          userId = appId;

          return userModel.findOne({ appId });
        })
        .then(userData => {
          userId = userData._id;
          return mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(userId) }, { $set: { isTerminated: true } });
        })
        .then(() => mentorModel.findOneAndUpdate({ userId: mongoose.Types.ObjectId(userId) }, { $set: { name: '탈퇴한 사용자입니다.', descriptionText: null, likesCount: 0, price: 0, tags: [], descriptionForMentor: encodeURIComponent('<p>탈퇴한 사용자입니다</p>') } }))
        .then(() => reviewModel.updateMany({ userId: mongoose.Types.ObjectId(userId) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }))
        .then((list) => Promise.all(list.map(ele => mentoringModel.findOne({ _id: mongoose.Types.ObjectId(ele.targetId) }))))
        .then(list => Promise.all(list.map(ele => {
          let count = ele.rateCount;
          let rate = ele.rate * count;

          rate /= count--;

          return mentorModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate } });
        })))
        .then(() => userModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(userId) }))
        .then(() => {
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
