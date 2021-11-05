import express from "express";
const router = express.Router();

import {userController} from "../../controller/index.js";
// const { verifyEmail, retryVerify } = require("../../controller/user");

router.post("/email", userController.verifyEmail);

router.post("/retry", userController.retryVerify);

export default router;
