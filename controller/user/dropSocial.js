/* eslint-disable camelcase */
import dotenv from 'dotenv';

import axios from 'axios';
// const { default: axios } = require('axios');
import { userModel, reviewModel, mentoringModel, mongoose, careerInfoModel } from '../../model/index.js';
import { tool, date } from '../tools/index.js';
// const { sha256Encrypt, verifyAndCallback, date } = require('../tools');

import randWords from 'random-words';
dotenv.config();

function base64decode (data) {
  while (data.length % 4 !== 0) {
    data += '=';
  }
  data = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(data, 'base64').toString('utf-8');
}

// 카카오 계정페이지 등에서 연결끊기를 누른경우에 실행됨.
// 클라이언트에서는 각 로그인마다 사용할 코드를 codes로 보냄
// 페북에서는 sdk로 토큰을 받아올수 있음.

export default async (req, res) => {
  const { model } = req.params;
  const { codes, fbToken } = req.body;

  const randomWords = randWords({ min: 3, exactly: 24, join: ' ' });

  // 클라이언트에서 회원탈퇴 요청이 들어온 경우
  if (req.body._id) {
    const split = req.cookies.authorization.split(' ');
    const accessToken = split[0].concat(' ', split[1]);

    if (!req.cookies.authorization) {
      res.status(200).json({ code: 401, message: 'not authorized' });
      return;
    }
    let userId;
    let sns;
    let likedCareerEdu;
    let likedMentor;
    let likedInfo;

    userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, {
      $set: {
        thumb: 'https://artoring.com/image/1626851218536.png',
        sns: [],
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
    }, { new: false })
    // userModel.findOne({ _id: mongoose.Types.ObjectId(req.body._id) })
      .then((userData) => {
        userId = userData._id;
        sns = userData.sns;

        likedCareerEdu = userData.likedCareerEdu;
        likedMentor = userData.likedMentor;
        likedInfo = userData.likedInfo;

        return userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(userId) }, {
          $set: {
            drop: {
              reason: req.body.reason,
              name: userData.name,
              date: new Date(date().add(9, 'hours').format())
            }
          }
        })
        // 쿠키에 있는 토큰 제외 3사 엑세스 토큰 발급.
          .then(() => {
            // sns.push({ access_token: accessToken, snsType: split[2], appId: });
            return sns.map((ele, key) => {
              let url;
              let clientId;
              let clientSecret;
              let contentType;

              if (ele.snsType === split[2] || ele.snsType === 'facebook') {
                return ele;
              }

              const redirect_uri = process.env.NODE_ENV === 'development' ? `https://localhost:3000/callback/${ele.snsType}` : `https://artoring.com/callback/${ele.snsType}`;
              if (ele.snsType === 'kakao') {
                url = 'https://kauth.kakao.com/oauth/token?';
                contentType = 'application/x-www-form-urlencoded;charset=utf-8';
                clientId = process.env.KAKAO_ID;
                clientSecret = process.env.KAKAO_SEC;
              } else if (ele.snsType === 'naver') {
                url = 'https://nid.naver.com/oauth2.0/token?';
                contentType = 'application/x-www-form-urlencoded;charset=utf-8';
                clientId = process.env.NAVER_ID;
                clientSecret = process.env.NAVER_SEC;
              }

              return axios.get(url.concat(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${codes[ele.snsType].code}&state=${codes[ele.snsType].state}`), {
                'Content-Type': contentType
              });
            });
          })
          .then(promise => {
            // 멘토링 정보 삭제
            return Promise
              .all(promise.map(ele => {
              // 3사 앱 연결끊기.

                const { access_token, refresh_token } = ele.data || ele;

                let proof;
                if (ele.snsType === 'facebook') proof = tool.sha256Encrypt(999, fbToken || access_token || split[1], process.env.FACEBOOK_SEC);

                const url = ele.snsType === 'kakao'
                  ? 'https://kapi.kakao.com/v1/user/unlink'
                  : ele.snsType === 'naver'
                    ? `https://nid.naver.com/oauth2.0/token?grant_type=delete&access_token=${access_token || accessToken}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`
                    : `https://graph.facebook.com/v11.0/${ele.appId}/permissions?appsecret_proof=${proof}&access_token=${fbToken || access_token || split[1]}`;

                return ele.snsType !== 'facebook'
                  ? ele.snsType === 'kakao'
                    ? axios.get(url, {
                      headers: {
                        Authorization: `${accessToken}`
                      }
                    })
                    : axios.get(url)
                  : axios.delete(url);
              })
              )
              .then(() => reviewModel.updateMany({ userId: mongoose.Types.ObjectId(req.body._id) }, { userName: '탈퇴한 사용자', text: '탈퇴한 사용자 입니다.', rate: 0, userThumb: 'https://artoring.com/image/1626851218536.png' }))
              .then(() => reviewModel.find({ userId: mongoose.Types.ObjectId(req.body._id) }))
              .then(list => Promise.all(list.map(ele => mentoringModel.findOne({ _id: mongoose.Types.ObjectId(ele.targetId) }))))
              .then(list => Promise.all(list.map(ele => {
                let count = ele.rateCount;
                let rate = ele.rate * count;

                rate /= count--;

                return mentoringModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate, tags: [], category: [], subCategory: [] } });
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
              });
          });
      }).catch(e => {
        console.log(e);
        res.status(500).send();
      });
  } else {
    // 네이버는 연동해지 알림 서비스가 없다. 또한 연동해제는 반드시 유저가 네이버 혹은 아토링에 로그인해야 함.
    // const [signedHeader, signedPayload] = req.body.signed_request.split('.', 2);
    // const key = req.headers.authorization.split(' ')[1];
    // if (key !== process.env.K_ADMIN || req.body.app_id !== process.env.K_ID) res.status(401).send();

    let signedHeader, signedPayload, key, promise;

    if (model === 'kakao') {
      key = req.headers.authorization.split(' ')[1];
      if (key !== process.env.K_ADMIN || req.body.app_id !== process.env.K_ID) {
        res.status(401).send();
        return;
      }
      promise = userModel.findOne({ sns: { $elemMatch: { appId: req.body.user_id } } });
    } else {
      [signedHeader, signedPayload] = req.body.signed_request.split('.', 2);
      promise = Promise.resolve(
        tool.sha256Encrypt(999, signedPayload, process.env.FACEBOOK_SEC, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', ''))
        .then(expectedToken => {
          if (expectedToken !== signedHeader) throw new Error('token mismatch');

          const { user_id: appId } = base64decode(signedPayload);
          userId = appId;

          return userModel.findOne({ sns: { $elemMatch: { appId: req.body.user_id } } });
        });
    }

    let userId;
    let userName;
    let sns;
    let likedCareerEdu;
    let likedMentor;
    let likedInfo;

    promise
      .then(userData => {
        // 해당 유저가 없는경우
        if (!userData) throw new Error(400);

        userId = userData._id;
        userName = userData.name;
        sns = userData.sns.filter(ele => ele.snsType !== 'naver');
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
          },
          drop: {
            name: userName,
            reason: req.body.reason,
            date: new Date(date().add(9, 'hours').format())
          }
        }
      }))
      .then(() => {
        return sns.map((ele, key) => {
          if (ele.snsType === 'kakao') return { appId: ele.appId, snsType: 'kakao' };

          const url = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_ID}&client_secret=${process.env.FACEBOOK_SEC}&grant_type=client_credentials`;
          return axios.get(url);
        });
      })
      .then(promise => {
        return Promise.all(promise.map(ele => {
          // 2사 앱 연결끊기.
          const { access_token, refresh_token } = ele.data || ele;

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

            return mentoringModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(ele._id) }, { $set: { count, rate, tags: [], category: [], subCategory: [] } });
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
            res.status(200).json({ url: `https://artoring.com/drop/facebook?id=${userId}`, confirmation_code: `${userId}Deleted!` });
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

;
