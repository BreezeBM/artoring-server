const express = require('express');
const router = express.Router();

const careerRouter = require('./career');
const uploader = require('./uploader');
const userRouter = require('./user');
const reviewRouter = require('./review');
const likesRouter = require('./likes');
const verifyRouter = require('./verify');

router.use('/career', careerRouter);
router.use('/upload', uploader);
router.use('/reviews', reviewRouter);
router.use('/likes', likesRouter);
router.use('/verify', verifyRouter);
router.use('/', userRouter);

module.exports = router;
