require('dotenv').config();

const axios = require('axios');
const { userModel } = require('../../model');
const { trimNaver, trimKakao } = require('../tools');

module.exports = async (req, res) => {
  try {
    const { type } = req.params;
    const { code, state } = req.body;

    const redirect_uri = process.env.NODE_ENV === 'development' ? `https://localhost:3000/callback/${type}` : `https://artoring.com/callback/${type}`;
    let url, clientSecret, clientId, contentType;
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

    if (type == 'naver' || type == 'kakao') {
      let response = await axios.get(url.concat(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}&state=${state}`), {
        'Content-Type': contentType
      });

      const { access_token, refresh_token } = response.data;

      const api_url = type === 'naver' ? 'https://openapi.naver.com/v1/nid/me' : 'https://kapi.kakao.com//v2/user/me';

      response = await axios.get(api_url, { headers: { Authorization: access_token.includes('Bearer') ? access_token : `Bearer ${access_token}` } });

      const userData = response.data.resultcode ? trimNaver(response.data.response) : trimKakao(response.data.kakao_account);
      const registered = await userModel.findOne({ email: userData.email });

      if (registered) {
        res.status(200).json({ accessToken: access_token, userData: registered });
      } else {
        userData.pwd = 'Oauth aacount';
        userData.interestedIn = [
          { name: '창업', val: false },
          { name: '취업', val: false },
          { name: '전문예술', val: false },
          { name: '프리랜서', val: false },
          { name: '대학원/유학', val: false },
          { name: '예술교육', val: false },
          { name: '연구개발', val: false },
          { name: '기획/창작/제작', val: false },
          { name: '크리에이터', val: false }, { name: '홍보마케팅', val: false },
          { name: '경영지원(인사 및 회계)', val: false },
          { name: '구분 외 관심사 or 기타', val: false }];
        await userModel.create(userData);
        res.status(200).json({ accessToken: access_token, userData, signup: true });
      }
    }
  } catch (e) {
    console.log(e, e.data);
    res.status(500).send(e.message);
  }
}
;
