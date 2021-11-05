import getProfile from './getProfile.js'
import putProfile from './putProfile.js'
import loginWithEmail from './loginWithEmail.js'
import signUpByEmail from './signUpByEmail.js'
import verifyEmail from './verifyEmail.js'
import retryVerify from './retryVerify.js'
import socialLogin from './socialLogin.js'
import passwordMod from './passwordMod.js'
import passwordCheck from './passwordCheck.js'
import getLike from './getLike.js'
import postPurchase from './postPerchase.js'
import postQuestions from './postQuestions.js'
import getPurchase from './getPurchase.js'
import * as payment from './iamport.js'
import logout from './logout.js'

import dropUser from './dropUser.js'
import dropSocial from './dropSocial.js'

import * as findCredential from './findCredent.js'

// const userController = {
//   getProfile,
//   putProfile,
//   loginWithEmail,
//   verifyEmail,
//   retryVerify,
//   signUpByEmail,
//   socialLogin,
//   logout,
//   passwordMod,
//   passwordCheck,
//   getLike,
//   postPurchase,
//   getPurchase,
//   dropUser,
//   dropSocial,
//   payment,
//   postQuestions,
//   findCredential
// };

export { getProfile,
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
  dropSocial,
  payment,
  postQuestions,
  findCredential };
