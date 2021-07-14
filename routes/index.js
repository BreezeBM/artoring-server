const express = require('express');
const router = express.Router();

const careerRouter = require('./career');
const uploader = require('./uploader');
const userRouter = require('./user');

router.use('/career', careerRouter);
router.use('/user', userRouter);
router.use('/upload', uploader);
module.exports = router;
