import express from 'express';

import { userController } from '../../controller/index.js';
const router = express.Router();
// const { userController } = require("../../controller");

// 일반 이메일 회원가입을 요청할 때 사용합니다.
router.post('/', userController.signUpByEmail);

export default router;
