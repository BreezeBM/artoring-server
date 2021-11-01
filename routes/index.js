import express from "express";
const router = express.Router();

import careerRouter from "./career/index.js";
import uploader from "./uploader/index.js";
import userRouter from "./user/index.js";
import reviewRouter from "./review/index.js";
import likesRouter from "./likes/index.js";
import verifyRouter from "./verify/index.js";
import searchRouter from "./search/index.js";
import purchaseRouter from "./purchase/index.js";
import adminRouter from "./admin/index.js";
import mentorRouter from "./mentor/index.js";

import findCredentialRouter from "./credential/index.js";

import { userController } from "../controller/index.js";

router.use("/career", careerRouter);
router.use("/mentor", mentorRouter);
router.use("/upload", uploader);
router.use("/reviews", reviewRouter);
router.use("/likes", likesRouter);
router.use("/verify", verifyRouter);
router.use("/search", searchRouter);
router.use("/reserve", purchaseRouter);
router.use("/admin", adminRouter);

// 아임포트 결제완료 웹훅
router.post("/iamport", userController.payment.webhook);

router.use("/credent", findCredentialRouter);

router.use("/", userRouter);

// module.exports = router;
export default router;
