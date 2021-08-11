const getProfile = require("./getProfile");
const putProfile = require("./putProfile");
const loginWithEmail = require("./loginWithEmail");
const signUpByEmail = require("./signUpByEmail");
const socialLogin = require("./socialLogin");
const getLike = require("./getLike");

const logout = require("./logout");

const careerCardController = {
  getProfile,
  putProfile,
  loginWithEmail,
  signUpByEmail,
  socialLogin,
  logout,
  getLike,
};

module.exports = careerCardController;
