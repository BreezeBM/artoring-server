const loginWithEmail = require('./loginWithEmail');
const signUpByEmail = require( './signUpByEmail');

const careerCardController = {
    signUpByEmail: signUpByEmail,
    loginWithEmail:loginWithEmail,
};

module.exports = careerCardController;