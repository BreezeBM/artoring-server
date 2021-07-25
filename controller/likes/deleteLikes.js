const { careerTeachCardModel, mentorModel, userModel } = require('../../model');
const { verifyJWTToken, UserException } = require('../tools');

// 좋아요는 유저가 등록하고, 삭제해야함.
module.exports = async (req, res) => {
  const { type } = req.query;
  const { targetModel, targetId } = req.params;

  // 각 타입에 대해 유저프로필을 각 오어스 서버에 요청하고, 이를 바탕으로 서버에 등록애함.
  if (type) {
    switch (type) {
      case 'naver': {
        break;
      }
      case 'kakao': {
        break;
      }
      case 'facebook': {
        break;
      }
      default: {
        const decode = await verifyJWTToken(req);

        switch (decode) {
          case 401: {
            res.staus(401).send();
            break;
          }
          case 403: {
            res.staus(403).send();
            break;
          }
          default: {
            try {
              // 멘터 혹은 커리어 교육 카드 좋아요에대해 공통으로 사용하기 위함.
              const careerOrMentorModel = targetModel === 'teach' ? careerTeachCardModel : mentorModel;
              const { email, name } = decode;
              console.log(decode, targetModel, targetId, type);
              // 어디서 좋아요를 눌렀는지에따라 유저 필드의 업데이트하는곳이 달라짐.
              const userData = targetModel === 'teach'
                ? await userModel.findOneAndUpdate({ email, name }, { $pull: { likedCareerEdu: targetId } }, { new: true })
                : await userModel.findOneAndUpdate({ email, name }, { $pull: { likedMentor: targetId } }, { new: true });

              // mongoose는 해당되는 도큐먼트가 없으면 데이터가 없음.
              if (!userData) throw new UserException('user fail', 'matched user not found');

              // 좋아요한곳에서 좋아요 숫자를 하나 증가시킴
              await careerOrMentorModel.updateOne({ id: targetId }, { $inc: { likesCount: -1 } });
              res.status(200).send();
            } catch (e) {
              console.log(e);
              if (e.type) { res.status(404).send(e.message); } else { res.status(500).send(e.message); }
            }
            break;
          }
        }
        break;
      }
    }
  }
}
;
