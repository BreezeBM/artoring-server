import express from "express";
const router = express.Router();

import userController from "../../controller/index.js";
// const { userController } = require("../../controller");

// 회원탈퇴

// 클라이언트 소셜 로그인 회원탈퇴
router.post("/social", userController.dropSocial);

// 외부 서비스  연동 해제 알림 핸들러
router.post("/:model", userController.dropSocial);

// 클라이언트 이메일 가입자 회원탈퇴
router.post("/", userController.dropUser);

router.use("/*", (req, res) => {
  res.status(404).send();
});

export default router;
