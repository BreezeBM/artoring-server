require('dotenv').config();
const { userModel } = require('../../model');
const { createJWT, sha256Encrypt } = require('../tools');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
  const { password, email } = req.body;
  const hashingTime = process.env.NODE_ENV === 'development'
    ? process.env.HASHING_TIME_DEV
    : process.env.HASHING_TIME_PRO;
  const salt = process.env.NODE_ENV === 'development'
    ? process.env.SALT_DEV
    : process.env.SALT_PRO;

  if (email) {
    userModel.findOne({ email })
      .select({
        _id: 1,
        pwd: 1,
        name: 1,
        thumb: 1,
        nickName: 1,
        email: 1,
        isMentor: 1,
        likedCareerEdu: 1,
        likedMentor: 1,
        likedInfo: 1,
        verifiedEmail: 1,
        createdAt: 1
      })
      .then((data) => {
        if (data) {
          bcrypt.compare(password, data.pwd)
            .then(async result => {
              if (result) {
                delete data.pwd;
                const token = await createJWT({ _id: data._id, name: data.name }, 3600);
                res.cookie('authorization', `Bearer ${token} email`, {
                  secure: true,
                  httpOnly: true,
                  // domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'back.artoring.com',
                  maxAge: 3600 * 1000,
                  sameSite: 'none',
                  path: '/'
                }).status(201).json({ userData: data });
              } else {
                res.status(401).send({ message: '잘못된 비밀번호' });
              }
            });
        } else {
          res.status(404).send({ message: '유저정보를 찾을수 없습니다.' });
        }
      })
      .catch(e => {
        console.log(e);
        res.status(500).json(e.message);
      });
  } else {
    res.status(400).send({ message: 'Invalid Access' });
  }
};
