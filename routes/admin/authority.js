const express = require('express');
const router = express.Router();

const authorityController = require('../../controller/admin');

router.use('/login', authorityController.login);
router.use('/logout', authorityController.logout);
router.use('/signup', authorityController.singup);

module.exports = router
;
