require('dotenv').config();

const { userModel, reviewModel, mentorModel, mentoringModel, mongoose } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {
  const { id } = req.query;

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
        mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(id) }, { $set: { isTerminated: true } })
          .then((list) => { return mentorModel.findOneAndUpdate({ userId: mongoose.Types.ObjectId(id) }, { $set: { name: '탈퇴한 사용자입니다.', descriptionText: null, likesCount: 0, price: 0, tags: [], descriptionForMentor: encodeURIComponent('<p>탈퇴한 사용자입니다</p>') } }); })
          .then((list) => { return reviewModel.updateMany({ userId: mongoose.Types.ObjectId(id) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }); })
          .then(list => {
            console.log(3, list);
            return Promise.all(list.map(ele => {
              return mentoringModel.findOne({ _id: mongoose.Types.ObjectId(ele.targetId) });
            }))
            ;
          })
          .then(list => {
            console.log(list);
            return Promise.all(list.map(ele => {
              let count = ele.rateCount;
              let rate = ele.rate * count;

              rate /= count--;

              return mentorModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate } });
            }));
          })
          .then(list => {
            console.log(list);
            return userModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) });
          })
          .then(() => {
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
