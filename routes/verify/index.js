const express = require('express');
const router = express.Router();

const { verifyEmail, retryVerify } = require('../../controller/user');

router.post('/email', verifyEmail);

router.post('/retry', retryVerify);

module.exports = router;
