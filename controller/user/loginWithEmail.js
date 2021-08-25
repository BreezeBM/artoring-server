require("dotenv").config();
const { userModel } = require("../../model");
const { createJWT, sha256Encrypt } = require("../tools");

module.exports = async (req, res) => {
  let { password, email } = req.body;
  const hashingTime = process.env.NODE_ENV === "development"
    ? process.env.HASHING_TIME_DEV
    : process.env.HASHING_TIME_PRO;
  const salt = process.env.NODE_ENV === "development"
    ? process.env.SALT_DEV
    : process.env.SALT_PRO;

  try {
    for (let i = 0; i < hashingTime; i++) {
      password = sha256Encrypt(999, password, salt);
    }

    if (email) {
      const data = await userModel.findOne({ email, pwd: password })
        .select({
          _id: 1,
          name: 1,
          thumb: 1,
          nickName: 1,
          email: 1,
          isMentor: 1,
          likedCareerEdu: 1,
          likedMentor: 1,
          likedInfo: 1,
          verifiedEmail: 1,
          createdAt: 1,
        });
      if (data) {
        const token = await createJWT({ _id: data._id, name: data.name }, 3600);
        res.status(201).json({ accessToken: token, userData: data });
      } else {
        res.status(404).send({ message: "유저정보를 찾을수 없습니다." });
      }
    } else {
      res.status(400).send({ message: "Invalid Access" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
};
