import dotenv from 'dotenv';

import { tool } from '../tools/index.js';
// const { sha256Encrypt } = require('../tools');
import { adminModel } from '../../model/index.js';

import randWords from 'random-words';
import bcrypt from 'bcrypt';
dotenv.config();
// const randWords = require('random-words');
// const bcrypt = require('bcrypt');

export default async (req, res) => {
  try {
    const hashingTime = process.env.NODE_ENV === 'development' ? process.env.HASHING_TIME_DEV_ADM : process.env.HASHING_TIME_PRO_ADM;
    const salt = process.env.NODE_ENV === 'development' ? process.env.SALT_DEV_ADM : process.env.SALT_PRO_ADM;

    bcrypt.genSalt(Number(hashingTime))
      .then(async salt => {
        const { pwd } = req.body;
        return bcrypt.hash(pwd, salt);
      })
      .then(async encrypt => {
        const { email, name } = req.body;
        const randomWords = randWords({ min: 3, exactly: 24, join: ' ' });

        const accessKey = tool.sha256Encrypt(999, randomWords, salt);

        // 접근 레벨(authorityLevel 은 1이 가장 작은 권한. 5가 맥스)
        await adminModel.create({ email, encrypt, pwd: encrypt, authorityLevel: 1, accessKey, name });

        res.status(201).send();
      });
    // let { email, pwd, name } = req.body;
    // for (let i = 0; i < hashingTime; i++) { pwd = sha256Encrypt(999, pwd, salt);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
}
;
