import express from "express";
const router = express.Router();

import { adminController } from "../../controller/index.js";

router.use("/login", adminController.login);
router.use("/logout", adminController.logout);
router.use("/signup", adminController.singup);

export default router;
