const express = require('express');
const router = express.Router();

const userContorller = require('../../controller/user');

router.get('/', userContorller.logout);

module.exports = router;
