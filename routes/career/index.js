const express = require('express');
const router = express.Router();
const teachRouter = require('./careerTeach');
const infoRouter = require('./careerInfo');

// 커리어 교육에 대한 카드 정보를 리턴해야 합니다.
router.use('/teach', teachRouter);

// 커리어 정보에 대한 카드들을 리턴해야 합니다.
router.use('/info', infoRouter);

router.use('/*', (req, res) => res.status(404).send());

module.exports = router;
