const express = require('express');
const router = express.Router();

const { userController } = require('../../controller');

// 회원탈퇴

// 클라이언트 소셜 로그인 회원탈퇴
router.get('/social', userController.dropSocial);

// 외부 서비스  연동 해제 알림 핸들러
router.post('/:model', userController.dropSocial);

// 클라이언트 이메일 가입자 회원탈퇴
router.get('/', userController.dropUser);

router.use('/*', (req, res) => {
  res.status(404).send();
});

module.exports = router;
