// 맨티가 멘토 신청을 하는경우 여기서 처리합니다.
import express from "express";
const router = express.Router();

import likesController from "../../controller/likes/index.js";

router.post("/:targetModel", likesController.postLikes);
router.delete("/:targetModel/:targetId", likesController.deleteLikes);

export default router;
