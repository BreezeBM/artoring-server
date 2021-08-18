const getProfile = require("./getProfile");
const putProfile = require("./putProfile");
const loginWithEmail = require("./loginWithEmail");
const signUpByEmail = require("./signUpByEmail");
const socialLogin = require("./socialLogin");
const passwordMod = require("./passwordMod");

const careerCardController = {
  getProfile,
  putProfile,
  loginWithEmail,
  signUpByEmail,
  socialLogin,
  passwordMod,
};

module.exports = careerCardController;
