require('dotenv').config();
const bcrypt = require('bcrypt');
const { userModel } = require('../../model');

module.exports = async (req, res) => {
  const decode = await verifyJWTToken(req);
  const { pwd, pwdChk } = req.body;

  const saltRounds = Number(process.env.SALT_ROUNDS);

  switch (decode) {
    case 401: {
      res.staus(401).send();
      break;
    }
    case 403: {
      res.staus(403).send();
      break;
    }
    default: {
      try {
        const { email, name } = decode;
        // 변경할 비밀번호와, 확인 비밀번호가 일치 하지 않으면 에러 발생
        if (pwd !== pwdChk) {
          return res.status(400).send({ message: 'Passwords do not match' });
        }

        // 비밀번호 해싱
        const newPwd = bcrypt.hashSync(pswd, saltRounds);
        // 해싱한 비밀번호를 업데이트
        const userData = await userModel.findOneAndUpdate({ email, name }, {
          $set: { pwd: newPwd }
        });

        res.status(200).send({ message: 'password modified and updated' });
      } catch (error) {
        res.statud(400).send({ message: 'error while modifing password' });
      }
    }
  }
};
