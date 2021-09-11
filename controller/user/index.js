const getProfile = require('./getProfile');
const putProfile = require('./putProfile');
const loginWithEmail = require('./loginWithEmail');
const signUpByEmail = require('./signUpByEmail');
const verifyEmail = require('./verifyEmail');
const retryVerify = require('./retryVerify');
const socialLogin = require('./socialLogin');
const passwordMod = require('./passwordMod');
const passwordCheck = require('./passwordCheck');
const getLike = require('./getLike');
const postPurchase = require('./postPerchase');
const getPurchase = require('./getPurchase');
const logout = require('./logout');

const dropUser = require('./dropUser');
const dropSocial = require('./dropSocial');

const careerCardController = {
  getProfile,
  putProfile,
  loginWithEmail,
  verifyEmail,
  retryVerify,
  signUpByEmail,
  socialLogin,
  logout,
  passwordMod,
  passwordCheck,
  getLike,
  postPurchase,
  getPurchase,
  dropUser,
  dropSocial
};

module.exports = careerCardController;
