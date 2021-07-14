const express = require('express');
const router = express.Router();

const { userController } = require("../../controller");


// 소셜로그인 이후 유저정보를 전송받을때 사용합니다.
router.post('/', () => {});

// 일반 이메일 회원가입을 요청할 때 사용합니다.
router.post('/', userController.signUpByEmail);

module.exports = router;
