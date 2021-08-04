const getProfile = require('./getProfile');
const putProfile = require('./putProfile');
const loginWithEmail = require('./loginWithEmail');
const signUpByEmail = require('./signUpByEmail');
const verifyEmail = require('./verifyEmail');
const socialLogin = require('./socialLogin');

const logout = require('./logout');

const careerCardController = { getProfile, putProfile, loginWithEmail, verifyEmail, signUpByEmail, socialLogin, logout };

module.exports = careerCardController
;
