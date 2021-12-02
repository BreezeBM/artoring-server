import searchEngine from './index.js';
import { userModel } from '../../model/index.js';

export default async (req, res) => {
  let { keyword, model, page } = req.query;
  keyword = decodeURIComponent(keyword).split(' ');

  const browser = req.headers['sec-ch-ua'].split(', ').slice(1);
  const mobile = req.headers['sec-ch-ua-mobile'] === '?0';
  const platform = req.headers['sec-ch-ua-platform'];
  const ip = req.headers['x-forwarded-for'].split(', ')[0].split('.').slice(0, 2);
  ip.push('*.*');

  // 하드웨어 대략적인 지역정보 및 대략적인 유저정보들을 바탕으로 분석용 데이터 생성.
  let userData = {
    gender: 'not login',
    age: 'not login',
    browser,
    mobile,
    platform,
    ip
  };
  if (req.query.id) {
    userModel.findById(req.query.id, { gender: 1, birth: 1, current: 1, interestedIn: 1 })
      .then((loginData) => {
        userData = loginData;
      });
  }

  searchEngine((error, data) => {
    if (error) {
      console.log(error);
      res.status(500).send();
    } else {
      res.json(data);
    }
  }, keyword, model, page, userData);
}
;
