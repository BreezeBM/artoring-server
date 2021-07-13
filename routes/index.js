const express = require('express');
const router = express.Router();

const careerRouter = require('./career');
const uploader = require('./uploader');

router.use('/career', careerRouter);
router.use('/upload', uploader);
module.exports = router;
