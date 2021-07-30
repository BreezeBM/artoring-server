const express = require('express');
const router = express.Router();

const { userController } = require('../../controller');

// 이메일 로그인에 사용합니다.
router.post('/email', userController.loginWithEmail);

// facebook 로그인에 요청사용합니다.
router.post('/:type', userController.socialLogin);

router.use('/*', (req, res) => {
  res.status(404).send();
});

module.exports = router;
