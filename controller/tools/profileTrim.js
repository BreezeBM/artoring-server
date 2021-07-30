// 네이버 유저정보를 스키마에 맞게 재구성

const trimNaver = (profile) => {
  const result = {};

  if (profile.nickname) result.nickName = profile.nickname;
  if (profile.email) result.email = profile.email;
  if (profile.name) result.name = profile.name;
  if (profile.phone) result.mobile = profile.mobile;
  if (profile.birth && profile.birthyear) { result.birth = profile.birthyear.concat(' ', profile.birth); }

  return result;
};

// 카카오 서버에서 전송되는 유저정보를 스키마에 맞게 재구성
const trimKakao = (account) => {
  const result = {};
  if (!account.profile_nickname_needs_agreement && account.profile && account.profile.nickname) result.nickName = account.profile.nickname;
  if (!account.profile_image_needs_agreement && account.profile && account.profile.thumbnail_image_url) result.thumb = account.profile.thumbnail_image_url;
  if (!account.email_needs_agreement && account.has_email && account.is_email_valid && account.is_email_verified) result.email = account.email;
  if (!account.gender_needs_agreement && account.has_gender) result.gender = account.gender;

  return result;
};

const trimFacebook = (data) => {
  const result = {};

  if (data.name) result.name = data.name;
  if (data.picture && data.picture.data && data.picture.data.url) result.thumb = data.picture.data.url;
  if (data.birthday) result.birthday = data.birthday;
  if (data.email) result.email = data.email;
  if (data.gender) result.gender = data.gender;

  return result;
};

const trimUserData = (userData) => {
  userData.pwd = 'Oauth aacount';
  if (!userData.name) userData.name = '';
  if (!userData.nickName) userData.nickName = '';
  if (!userData.gender) userData.gender = '';
  if (!userData.birth) userData.birth = '';
  if (!userData.phone) userData.phone = '';
  if (!userData.major) userData.major = '';
  if (!userData.current) {
    userData.current = {
      jobTitle: '',
      belongs: '',
      howLong: '',
      dept: ''
    };
  }
  if (!userData.thumb) userData.thumb = 'https://artoring.com/img/1626851218536.png';
  if (!userData.likedCareerEdu) userData.likedCareerEdu = [];
  if (!userData.likedMentor) userData.likedMentor = [];
  if (!userData.outdoorAct) userData.outdoorAct = '';
  if (!userData.workHistory) userData.workHistory = '';
  userData.isMentor = false;
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
};

module.exports = { trimKakao, trimNaver, trimFacebook, trimUserData }
;