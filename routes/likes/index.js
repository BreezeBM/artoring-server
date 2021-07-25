// 맨티가 멘토 신청을 하는경우 여기서 처리합니다.
const express = require('express');
const router = express.Router();

const likesController = require('../../controller/likes');

router.post('/:targetModel', likesController.postLikes);
router.delete('/:targetModel/:targetId', likesController.deleteLikes);

module.exports = router;
