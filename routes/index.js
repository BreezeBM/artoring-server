const express = require('express');
const router = express.Router();

const careerRouter = require('./career');
const uploader = require('./uploader');
const userRouter = require('./user');
const reviewRouter = require('./review');
const likesRouter = require('./likes');
const verifyRouter = require('./verify');
const searchRouter = require('./search');
const purchaseRouter = require('./purchase');
const adminRouter = require('./admin');
const mentorRouter = require('./mentor');

router.use('/career', careerRouter);
router.use('/mentor', mentorRouter);
router.use('/upload', uploader);
router.use('/reviews', reviewRouter);
router.use('/likes', likesRouter);
router.use('/verify', verifyRouter);
router.use('/search', searchRouter);
router.use('/reserve', purchaseRouter);
router.use('/admin', adminRouter);

router.use('/', userRouter);

module.exports = router;
