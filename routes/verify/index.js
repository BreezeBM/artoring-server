import express from "express";
const router = express.Router();

import * as userController from "../../controller/user/index.js";
// const { verifyEmail, retryVerify } = require("../../controller/user");

router.post("/email", userController.verifyEmail);

router.post("/retry", userController.retryVerify);

export default router;
