require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyJWTToken = async (req) => {
  if (!req.headers.authorization) return 401;
  else {
    if (req.headers.authorization.indexOf('Bearer') < 0) return 401;
    const token = req.headers.authorization.split(' ')[1];
    const decode = await jwt.verify(token, process.env.JWT_SEC_KEY);

    if (!decode) return 403;
    else return decode;
  }
};

module.exports = { verifyJWTToken };
