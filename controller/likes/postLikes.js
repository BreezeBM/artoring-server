const { mentoringModel, userModel } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');

// 에러시 throw를 하기위한 템플릿
function UserException (type, message) {
  this.type = type;
  this.message = message;
  this.toString = function () {
    return this.message;
  };
}

// 좋아요는 유저가 등록하고, 삭제해야함.
module.exports = async (req, res) => {
  const { type, targetId, _id } = req.body;
  const { targetModel } = req.params;

  const accessToken = req.headers.authorization;

  // 각 타입에 대해 유저프로필을 각 오어스 서버에 요청하고, 이를 바탕으로 서버에 등록애함.
  // 템플릿 사용해야한다.
  if (type) {
    if (type === 'email') {
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
            // 멘터 혹은 커리어 교육 카드 좋아요에대해 공통으로 사용하기 위함.

            const { _id } = decode;

            // 어디서 좋아요를 눌렀는지에따라 유저 필드의 업데이트하는곳이 달라짐.
            const userData = targetModel === 'teach'
              ? await userModel.findOneAndUpdate({ _id }, { $push: { likedCareerEdu: targetId } }, { new: true })
              : await userModel.findOneAndUpdate({ _id }, { $push: { likedMentor: targetId } }, { new: true });

            // mongoose는 해당되는 도큐먼트가 없으면 데이터가 없음.
            if (!userData) throw new UserException('user fail', 'matched user not found');

            // 좋아요한곳에서 좋아요 숫자를 하나 증가시킴
            await mentoringModel.updateOne({ _id: targetId }, { $inc: { likesCount: 1 } });
            res.status(201).send();
          }
            break;
        }
      } catch (e) {
        console.log(e);
        if (e.type) { res.status(404).send(e.message); } else { res.status(500).send(e.message); }
      }
    } else {
      try {
        verifyAndCallback(async () => {
          const userData = targetModel === 'teach'
            ? await userModel.findOneAndUpdate({ _id }, { $push: { likedCareerEdu: targetId } }, { new: true })
            : await userModel.findOneAndUpdate({ _id }, { $push: { likedMentor: targetId } }, { new: true });

          if (!userData) throw new UserException('user fail', 'matched user not found');

          // 좋아요한곳에서 좋아요 숫자를 하나 증가시킴
          await mentoringModel.updateOne({ id: targetId }, { $inc: { likesCount: 1 } });
          res.status(201).send();
        }, type, accessToken, res);
      } catch (e) {
        res.status(500).send();
      }
    }
  }
};
