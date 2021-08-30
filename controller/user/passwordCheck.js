require('dotenv').config();
const bcrypt = require('bcrypt');
const { userModel, mongoose } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {
  try {
    const decode = await verifyJWTToken(req);
    const { pwd, _id } = req.body;

    switch (decode) {
      case 401: {
        res.status(401).send();
        break;
      }
      case 403: {
        res.status(403).send();
        break;
      }
      default: {
        userModel.findOne({ _id: mongoose.Types.ObjectId(_id) })
          .select({
            pwd: 1
          })
          .then((data) => {
            if (data) {
              return bcrypt.compare(pwd, data.pwd);
            } else {
              res.status(404).send({ message: '유저정보를 찾을수 없습니다.' });
            }
          })
          .then(result => {
            // 비밀번호가 이전거와 일치
            if (result) {
              res.status(400).send('same password');
            } else {
              res.status(200).send();
            }
          })
          .catch(e => {
            console.log(e);
            res.status(500).json(e.message);
          });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
};
