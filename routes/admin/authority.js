const express = require('express');
const router = express.Router();

const authorityController = require('../../controller/admin');

router.use('/loigin', authorityController.login);
router.use('/signup', authorityController.singup);

module.exports = router
;