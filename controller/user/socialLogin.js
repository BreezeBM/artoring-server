/* eslint-disable camelcase */
import dotenv from 'dotenv';

import axios from 'axios';
import { userModel } from '../../model/index.js';
import { tool, profileTrim } from '../tools/index.js';
// const { trimNaver, trimKakao, trimFacebook, trimUserData } = require(
//   "../tools",
// );
// const { sha256Encrypt } = require("../tools");

dotenv.config();
export default async (req, res) => {
  try {
    const { type } = req.params;
    const { code, state, id } = req.body; // 여기의 id는 페이스북만의 특수한 숫자 아이디.

    let { token } = req.body;
    let access_token, refresh_token;

    if (!req.cookies.authorization || req.cookies.authorization === '') {
      const redirect_uri = process.env.NODE_ENV === 'development'
        ? `https://localhost:3000/callback/${type}`
        : `https://artoring.com/callback/${type}`;
      let url, clientSecret, clientId, contentType;

      if (type === 'kakao' || type === 'naver') {
        if (type === 'kakao') {
          url = 'https://kauth.kakao.com/oauth/token?';
          contentType = 'application/x-www-form-urlencoded;charset=utf-8';
          clientId = process.env.KAKAO_ID;
          clientSecret = process.env.KAKAO_SEC;
        } else if (type === 'naver') {
          url = 'https://nid.naver.com/oauth2.0/token?';
          contentType = 'application/x-www-form-urlencoded;charset=utf-8';
          clientId = process.env.NAVER_ID;
          clientSecret = process.env.NAVER_SEC;
        }

        const response = await axios.get(
          url.concat(
            `client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}&state=${state}`
          ),
          {
            'Content-Type': contentType
          }
        );

        // 선언없이 구조분해 할당을 사용/
        ({ access_token, refresh_token } = response.data);

        // 프로필 요청 혹은 토큰검증을 통해 id를 가져와야 한다.
      }
    } else {
      token = token || req.cookies.authorization.split(' ')[1];
      access_token = access_token || req.cookies.authorization.split(' ')[1];
    }

    let proof;
    if (type === 'facebook') {
      proof = tool.sha256Encrypt(999, token, process.env.FACEBOOK_SEC);
    }

    const api_url = type === 'naver'
      ? 'https://openapi.naver.com/v1/nid/me' // 네이버
      : type === 'kakao'
        ? 'https://kapi.kakao.com//v2/user/me' // 카카오
        : `https://graph.facebook.com/v11.0/${id}?fields=id,name,picture,birthday,email&appsecret_proof=${proof}&access_token=${token}`; // 페이스북

    let response;
    type !== 'facebook'
      ? response = await axios.get(api_url, {
        headers: {
          Authorization: access_token.includes('Bearer')
            ? access_token
            : `Bearer ${access_token}`
        }
      })
      : response = await axios.get(api_url);

    const userData = response.data.resultcode
      ? profileTrim.trimNaver(response.data.response)
      : response.data.kakao_account
        ? profileTrim.trimKakao(response.data.kakao_account)
        : profileTrim.trimFacebook(response.data);

    const registered = await userModel
      .findOne({ email: userData.email })
      .select({
        _id: 1,
        thumb: 1,
        name: 1,
        email: 1,
        phone: 1,
        verifiedPhone: 1,
        isMentor: 1,
        likedCareerEdu: 1,
        likedMentor: 1,
        likedInfo: 1,
        verifiedEmail: 1,
        createdAt: 1,
        sns: 1
      });

    if (req.cookies.authorization && req.cookies.authorization !== '') {
      res.status(200).json(registered);
    } else if (registered) {
      // 등록된 이메일의 경우는 소셜로그인 종류 확인 및 토큰 발급.
      // 등록되어 있지 않은 소셜 로그인의 경우
      if (
        !registered.sns ||
        registered.sns.findIndex((ele) => ele.snsType === type) === -1
      ) {
        // 유저 id 정보를 토큰검증을 통해 획득한다.
        if (type === 'kakao') {
          const { data: tokenInfo } = await axios.get(
            'https://kapi.kakao.com/v1/user/access_token_info',
            {
              headers: {
                authorization: `Bearer ${access_token}`,
                'Content-type':
                  'application/x-www-form-urlencoded;charset=utf-8'
              }
            }
          );
          userData.sns[0].appId = tokenInfo.id;
        }

        userModel.findOneAndUpdate({ email: userData.email }, {
          $push: { sns: userData.sns[0] }
        })
          .then(() => {
            res.cookie(
              'authorization',
              `Bearer ${access_token || token} ${type}`,
              {
                secure: true,
                httpOnly: true,
                // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
                maxAge: 3600 * 1000,
                sameSite: 'none',
                path: '/'
              }
            ).status(200).json({ trimedData: registered });
          });

        // 등록되어 있는 소셜 로그인의 경우
      } else {
        res.cookie('authorization', `Bearer ${access_token || token} ${type}`, {
          secure: true,
          httpOnly: true,
          // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
          maxAge: 3600 * 1000,
          sameSite: 'none',
          path: '/'
        }).status(200).json({ trimedData: registered });
      }
    } else {
      profileTrim.trimUserData(userData);

      // 카카오 id를 토큰검증을 통해 확인
      if (type === 'kakao') {
        const { data: tokenInfo } = await axios.get(
          'https://kapi.kakao.com/v1/user/access_token_info',
          {
            headers: {
              authorization: `Bearer ${access_token}`,
              'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
          }
        );
        userData.sns[0].appId = tokenInfo.id;
      }

      const createdDoc = await userModel.create(userData);
      userData._id = createdDoc._id;

      res.cookie('authorization', `Bearer ${access_token || token} ${type}`, {
        secure: true,
        httpOnly: true,
        // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
        maxAge: 3600 * 1000,
        sameSite: 'none',
        path: '/'
      }).status(200).json({ trimedData: userData, signup: true });
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
};
