require('dotenv').config();
const bcrypt = require('bcrypt');
const { userModel, mongoose } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {
  const decode = await verifyJWTToken(req);
  const { pwd, pwdChk } = req.body;

  const saltRounds = Number(process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV : process.env.HASHING_TIME_PRO);

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
      const { _id, name } = decode;
      // 변경할 비밀번호와, 확인 비밀번호가 일치 하지 않으면 에러 발생
      if (pwd !== pwdChk) {
        return res.status(400).send({ message: 'Passwords do not match' });
      }

      // 비밀번호 해싱
      bcrypt.hash(pwd, saltRounds)
        .then((encrypted) => {
          return userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id), name }, {
            $set: { pwd: encrypted }
          });
        })
      // 해싱한 비밀번호를 업데이트

        .then(() => res.status(200).send({ message: 'password modified and updated' }))
        .catch(e => res.status(400).send({ message: 'error while modifing password' }));
    }
  }
};
