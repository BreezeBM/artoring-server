const express = require('express');
const router = express.Router();

const gradeRouter = require('./grade');
const calculateRouter = require('./adminCalculate');
const adminCareerInfoRouter = require('./adminCareerInfo');
const adminCareerTeachRouter = require('./adminCareerTeach');
const authorityRouter = require('./authority');

router.use('/grade', gradeRouter);
router.use('/calculate', calculateRouter);
router.use('/careerinfo', adminCareerInfoRouter);
router.use('/careerteach', adminCareerTeachRouter);
router.use('/', authorityRouter);

router.use('/*', (req, res) => res.status(404).send());
