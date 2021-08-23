

const getProfile = require('./getProfile');
const putProfile = require('./putProfile');
const loginWithEmail = require('./loginWithEmail');
const signUpByEmail = require('./signUpByEmail');
const verifyEmail = require('./verifyEmail');
const retryVerify = require('./retryVerify');
const socialLogin = require('./socialLogin');
const getLike = require("./getLike");
const postPurchase = require('./postPerchase');
const getPurchase = require('./getPurchase');

=======
const careerCardController = { getProfile, putProfile, loginWithEmail, verifyEmail, retryVerify, signUpByEmail, socialLogin, logout, postPurchase, getPurchase, getLike };

module.exports = careerCardController;
