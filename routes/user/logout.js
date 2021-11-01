import express from "express";
const router = express.Router();

import userContorller from "../../controller/user/index.js";

router.get("/", userContorller.logout);

export default router;
