const express = require('express');
const router = express.Router();

const careerRouter = require('./career');

router.use('/career', careerRouter);

module.exports = router;
