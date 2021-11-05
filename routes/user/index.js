import express from "express";
const router = express.Router();

import loginRouter from "./login.js";
import logoutRouter from "./logout.js";
import profileRouter from "./profile.js";
import signupRouter from "./signup.js";
import dropRouter from "./drop.js";

router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/profile", profileRouter);
router.use("/signup", signupRouter);
router.use("/drop", dropRouter);

router.use("/*", (req, res) => res.status(404).send());

export default router;
