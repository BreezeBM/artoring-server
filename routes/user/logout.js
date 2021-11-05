import express from "express";
const router = express.Router();

import {userController} from "../../controller/index.js";

router.get("/", userController.logout);

export default router;
