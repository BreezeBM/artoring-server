import singup from './signup.js';
import login from './login.js';
import getPurchase from './getAdminPurchase.js';
import putPurchase from './togglePurchase.js';
import queryName from './getMentorName.js';
import logout from './logout.js';
import dropMentor from './dropMentor.js';

// const adminController = {
//   singup,
//   login,
//   getPurchase,
//   putPurchase,
//   queryName,
//   logout,
// }

const getDrop = dropMentor.getDrop;
const setDrop = dropMentor.setDrop;

export {
  singup,
  login,
  getPurchase,
  putPurchase,
  queryName,
  logout,
  getDrop,
  setDrop
};
