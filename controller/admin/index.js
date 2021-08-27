const singup = require('./signup');
const login = require('./login');
const getPurchase = require('./getAdminPurchase');
const putPurchase = require('./togglePurchase');
const queryName = require('./getMentorName');
const logout = require('./logout');

module.exports = {
  singup, login, getPurchase, putPurchase, queryName, logout
}
;
