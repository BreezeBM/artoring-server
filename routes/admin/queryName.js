import express from 'express';

// const gradeRouter = require('./grade');
// const calculateRouter = require('./adminCalculate');
// const adminCareerInfoRouter = require('./adminCareerInfo');
// const adminCareerTeachRouter = require('./adminCareerTeach');
import { adminController } from '../../controller/index.js';
const router = express.Router();

// router.use('/grade', gradeRouter);
// router.use('/calculate', calculateRouter);
// router.use('/careerinfo', adminCareerInfoRouter);
// router.use('/careerteach', adminCareerTeachRouter);

router.post('/', adminController.queryName);

router.use('/*', (req, res) => res.status(404).send());

export default router;
