import express from "express";
const router = express.Router();

import { adminController } from "../../controller/index.js";

router.get("/:id", adminController.getPurchase);
router.get("/", adminController.getPurchase);
router.post("/", adminController.putPurchase);

export default router;
