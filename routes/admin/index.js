const express = require('express');
const router = express.Router();

// const gradeRouter = require('./grade');
// const calculateRouter = require('./adminCalculate');
// const adminCareerInfoRouter = require('./adminCareerInfo');
// const adminCareerTeachRouter = require('./adminCareerTeach');
const authorityRouter = require('./authority');
const purchaseRouter = require('./adminPurchase');
const nameRouter = require('./queryName');

// router.use('/grade', gradeRouter);
// router.use('/calculate', calculateRouter);
// router.use('/careerinfo', adminCareerInfoRouter);
// router.use('/careerteach', adminCareerTeachRouter);

router.use('/purchase', purchaseRouter);
router.use('/name', nameRouter);
router.use('/', authorityRouter);

router.use('/*', (req, res) => res.status(404).send());

module.exports = router;
