const express = require('express');
const router = express.Router();

const loginRouter = require('./login');
const logoutRouter = require('./logout');
const profileRouter = require('./profile');
const signupRouter = require('./signup');

router.use('/login', loginRouter);
router.use('/logout', logoutRouter);
router.use('/profile', profileRouter);
router.use('/signup', signupRouter);

router.use('/*', (req, res) => res.status(404).send());
module.exports = router
;
