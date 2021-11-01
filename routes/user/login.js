import express from "express";
const router = express.Router();

import userController from "../../controller/index.js";
// const { userController } = require("../../controller");

router.post("/", (req, res) => {
  if (req.cookies.authorization) {
    const target = req.cookies.authorization.split(" ")[2];
    if (!target) res.status(400).send();
    else res.redirect(307, "./" + target);
  } else res.status(400).send();
});

// 이메일 로그인에 사용합니다.
router.post("/email", userController.loginWithEmail);

// facebook 로그인에 요청사용합니다.
router.post("/:type", userController.socialLogin);

router.use("/*", (req, res) => {
  res.status(404).send();
});

export default router;
