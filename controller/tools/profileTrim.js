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

module.exports = { trimKakao, trimNaver }
;
