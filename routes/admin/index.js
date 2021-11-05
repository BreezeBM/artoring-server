import express from "express";
const router = express.Router();

// const gradeRouter = require('./grade');
// const calculateRouter = require('./adminCalculate');
// const adminCareerInfoRouter = require('./adminCareerInfo');
// const adminCareerTeachRouter = require('./adminCareerTeach');
import authorityRouter from "./authority.js";
import purchaseRouter from "./adminPurchase.js";
import nameRouter from "./queryName.js";

// router.use('/grade', gradeRouter);
// router.use('/calculate', calculateRouter);
// router.use('/careerinfo', adminCareerInfoRouter);
// router.use('/careerteach', adminCareerTeachRouter);

router.use("/purchase", purchaseRouter);
router.use("/name", nameRouter);
router.use("/", authorityRouter);

router.use("/*", (req, res) => res.status(404).send());

export default router;
