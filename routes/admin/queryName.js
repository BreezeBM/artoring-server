import express from "express";
const router = express.Router();

// const gradeRouter = require('./grade');
// const calculateRouter = require('./adminCalculate');
// const adminCareerInfoRouter = require('./adminCareerInfo');
// const adminCareerTeachRouter = require('./adminCareerTeach');
import * as adminController from "../../controller/admin/index.js";

// router.use('/grade', gradeRouter);
// router.use('/calculate', calculateRouter);
// router.use('/careerinfo', adminCareerInfoRouter);
// router.use('/careerteach', adminCareerTeachRouter);

router.post("/", adminController.queryName);

router.use("/*", (req, res) => res.status(404).send());

export default router;
