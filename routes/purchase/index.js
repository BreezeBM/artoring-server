const express = require('express');
const router = express.Router();

const { userController } = require('../../controller');

// 이메일 로그인에 사용합니다.
router.post('/', userController.postPurchase);
router.get('/', userController.getPurchase);
// facebook 로그인에 요청사용합니다.
// router.get('/:type', userController.socialLogin);

router.use('/*', (req, res) => {
  res.status(404).send();
});

module.exports = router;
