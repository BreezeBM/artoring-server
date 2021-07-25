const getProfile = require('./getProfile');
const putProfile = require('./putProfile');
const loginWithEmail = require('./loginWithEmail');
const signUpByEmail = require( './signUpByEmail');

const careerCardController = { getProfile, putProfile, loginWithEmail, signUpByEmail };

module.exports = careerCardController
;