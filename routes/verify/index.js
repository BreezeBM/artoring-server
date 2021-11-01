import express from "express";
const router = express.Router();

import { retryVerify, verifyEmail } from "../../controller/user/index.js";
// const { verifyEmail, retryVerify } = require("../../controller/user");

router.post("/email", verifyEmail);

router.post("/retry", retryVerify);

export default router;
