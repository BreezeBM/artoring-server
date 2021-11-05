import express from "express";
const router = express.Router();

// const { userController } = require("../../controller");
import * as userController from "../../controller/index.js";
// 이메일 찾기
router.post("/email", userController.findCredential.email);

// 비밀번호 변경 요청
router.post("/pwd", userController.findCredential.pwdReq);

// 비밀번호 검증 및 반영
router.post("/check", userController.findCredential.pwdVerify);

export default router;
