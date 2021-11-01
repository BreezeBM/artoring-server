import express from "express";
const router = express.Router();

import authorityController from "../../controller/admin/index.js";

router.use("/login", authorityController.login);
router.use("/logout", authorityController.logout);
router.use("/signup", authorityController.singup);

export default router;
