require('dotenv').config();

import {tool, date} from '../tools/index.js'
// const { verifyJWTToken, AdminAccessException, date } = require('../tools');

export default async (req, res) => {
  /*
   * 어드민 계정들은 email, pwd, 접근 레벨, 고유한 accessKey를 가집니다.
   */
  try {
    if (req.cookies.auth) {
      const decode = await tool.verifyJWTToken(req);

      switch (decode) {
        case 401: {
          res.status(401).send();
          break;
        }
        case 403: {
          res.status(403).send();
          break;
        }
        // verify  성공.
        default: {
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

          const { name, accessKey, authLevel } = decode;

          if (!accessKey) throw new tool.AdminAccessException('need authorize');
          res.cookie('auth', '', { expires: new Date(date().add(9, 'hours').format()) });

          res.status(200).json({ userData: { name, accessKey, authLevel } });
        }
      }
    } else {
      res.status(401).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
}
;
