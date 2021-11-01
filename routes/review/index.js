import express from "express";
const router = express.Router();

import reviewController from "../../controller/review/index.js";

router.get("/:cardids", reviewController.getReview);
router.post("/", reviewController.postReview);
router.put("/", () => {});
router.delete("/", () => {});

export default router;
