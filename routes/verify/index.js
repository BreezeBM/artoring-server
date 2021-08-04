const express = require('express');
const router = express.Router();

const { verifyEmail } = require('../../controller/user');

router.post('/email', verifyEmail);

router.post('/retry', () => {});

module.exports = router;
