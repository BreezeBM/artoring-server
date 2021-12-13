/* eslint-disable camelcase */
import dotenv from 'dotenv';
import { userModel, mentoringModel, adminModel, reviewModel, careerInfoModel, mongoose } from '../../model/index.js';
import { tool, sendGmail, date } from '../tools/index.js';
import axios from 'axios';

import randWords from 'random-words';

dotenv.config();

/**
 *
 * @param {*} req.body = null
 * @authorization req.header.auth
 * @querystring page, size
 *
 * * req.header.auth = 어드민 토큰 있어야함.
 * * page - 페이지네이션 페이지
 * * size - 요청한 페이지 숫자
 */
const getDrop = async (req, res) => {
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
      // verify  성공.
      default: {
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

        const { name, accessKey, authLevel } = decode;

        if (!accessKey || authLevel === 0) throw new tool.AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = await tool.aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new tool.AdminAccessException('no match found');
        const { page, size } = req.query;
        // userModel.find({ isMentor: true, isDrop: 0 }, null, { skip: (Number(page) - 1) * (Number(size) || 10), limit: Number(size) || 10 })
        //   .select({ _id: 1, mentor: 1, drop: 1, thumb: 1, current: 1 })
        userModel.aggregate([
          { $match: { isMentor: true, isDrop: 0 } },
          { $project: { _id: 1, mentor: 1, name: 1, drop: 1, thumb: 1, current: 1, phone: 1, isDrop: 1 } },
          {
            $facet: {
              cardList: [{ $skip: (Number(page) - 1) * (Number(size) || 10) }, { $limit: Number(size) || 10 }],
              total: [
                {
                  $count: 'count'
                }
              ]
            }
          }
        ])
          .then(list => res.status(200).json({ code: 200, data: list[0] }));
      }
    }
  } catch (e) {
    res.status(500).send();
  }
};

/**
 *
 * @param {*} req.body = {
 * * _id: 멘토의 _id
 * }
 * * body에 담긴 _id를 바탕으로 멘토를 탈퇴처리한다.
 *
 * ! requirement
 * ! header - auth 쿠키
 */
const setDrop = async (req, res) => {
  const randomWords = randWords({ min: 3, exactly: 24, join: ' ' });

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
      // verify  성공.
      default: {
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

        const { name, accessKey, authLevel } = decode;

        if (!accessKey || authLevel === 0) throw new tool.AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = await tool.aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new tool.AdminAccessException('no match found');

        let userId;
        let userName;
        let sns;
        let email;
        let likedCareerEdu;
        let likedMentor;
        let likedInfo;

        userModel.findById(req.body._id)
          .then(userData => {
            // 해당 유저가 없는경우
            if (!userData) throw new Error(400);

            userId = userData._id;
            userName = userData.name;
            email = userData.email;
            sns = userData.sns.filter(ele => ele.snsType !== 'naver');
            likedCareerEdu = userData.likedCareerEdu;
            likedMentor = userData.likedMentor;
            likedInfo = userData.likedInfo;

            return mentoringModel.updateMany({ moderatorId: mongoose.Types.ObjectId(userId) }, { $set: { isTerminated: true } });
          })
          .then(() => userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(userId) }, {
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
              'mentor.paymentInfo': '',
              drop: {
                name: userName,
                reason: req.body.reason,
                date: new Date(date().add(9, 'hours').format())
              }
            }
          }))
          .then((ds) => {
            return sns.map((ele, key) => {
              if (ele.snsType === 'kakao') return { appId: ele.appId, snsType: 'kakao' };

              const url = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_ID}&client_secret=${process.env.FACEBOOK_SEC}&grant_type=client_credentials`;
              return axios.get(url);
            });
          })
          .then(promise => {
            return Promise.all(promise.map(ele => {
              // 2사 앱 연결끊기.
              const { access_token } = ele.data || ele;

              let proof;
              if (ele.snsType === 'facebook') proof = tool.sha256Encrypt(999, access_token, process.env.FACEBOOK_SEC);

              const url = ele.snsType === 'kakao'
                ? 'https://kapi.kakao.com/v1/user/unlink'
                : `https://graph.facebook.com/v11.0/${ele.appId}/permissions?appsecret_proof=${proof}&access_token=${access_token}`;

              return ele.snsType !== 'facebook'
                ? axios.post(url, {
                  target_id_type: 'user_id',
                  target_id: ele.appId
                }, {
                  headers: {
                    authorization: `KakaoAK ${process.env.KAKAO_ADM}`
                  }
                })
                : axios.delete(url);
            }))
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
              .then(() => sendGmail({
                email,
                userData: {
                  email
                }
              }, res, {
                subject: '[아토링] 회원탈퇴가 완료되었습니다.',
                html:
                `<table style="border-collapse: collapse; width: 490px; margin-left: auto; margin-right: auto; height: 435px;" border="0">
                <tbody>
                <tr style="height: 353px;">
                <td style="width: 490px; height: 353px;">
                <div><img style="width: 114px; height: 17px; display: block; margin-left: auto; margin-right: auto; padding-bottom: 55px;" src="https://artoring.com/img/logo.png" alt="로고" /></div>
                <div style="font-family: NanumSquareRoundOTFEB; font-size: 24px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.25; letter-spacing: normal; color: #ff4a70; padding-bottom: 30px; text-align: center;">회원 탈퇴가 완료되었습니다.</div>
                <div style="text-align: center;"><strong><span style="font-size: 14pt; font-family: NanumSquareRound;">안녕하세요 아토링 대표 오설윤입니다.</span></strong></div>
                <div style="text-align: center;">&nbsp;</div>
                <div style="margin-bottom: 10px; text-align: center; line-height: 1;"><span style="font-size: 14pt; font-family: NanumSquareRound;">그동안 아토링 서비스를 이용해 주셔서 감사드립니다.</span></div>
                <div style="margin-bottom: 50px; text-align: center; line-height: 1;"><span style="font-size: 14pt; font-family: NanumSquareRound;">더 나은 서비스를 위해 최선을 다하도록 하겠습니다.</span></div>
                </td>
                </tr>
                <tr style="height: 82px;">
                <td style="width: 490px; height: 82px; text-align: center;">
                <div style="text-align: left;">
                <table style="border-collapse: collapse; width: 69.5938%; height: 22px; margin-left: auto; margin-right: auto;" border="0">
                <tbody>
                <tr style="height: 22px;">
                <td style="width: 100%; height: 22px; text-align: center;"><span style="font-family: NanumSquareRound; font-size: 8pt; color: #b7b7b7; letter-spacing: normal;"><span style="color: #999999;">본 메일은 발신 전용입니다.&nbsp; 회신을 통한 문의는 처리되지 않습니다.</span><br /><span style="color: #999999;">서비스관련 궁금하신 사항은 아토링 고객센터에서 문의해주세요.</span></span></td>
                </tr>
                </tbody>
                </table>
                <p style="line-height: 1; text-align: center;"><span style="color: #999999; font-size: 8pt;">인사이드 아트 | 서울시 성북구 삼선교로 18나 길 5 b102호 | 대표 오설윤 | 사업자 번호 532-08-02173<br /></span></p>
                </div>
                </td>
                </tr>
                </tbody>
                </table>
                `
              }
              ))
              .then(() => {
                res.status(200).send();
              });
          })
          .catch(e => {
            console.log(e);

            // 해당 유저가 없는경우
            if (e.message === '1') {
              res.status(404).send();
            } else { res.status(500).send(); }
          });
      }
    }
  } catch (e) {
    res.status(500).send();
  }
};

export default { getDrop, setDrop };
