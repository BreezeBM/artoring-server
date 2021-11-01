import express from "express";
const router = express.Router();

import infoController from "../../controller/career/index.js";

// 교육, 모임등을 가진 모든 카테고리 정보를 리턴해야 합니다.
router.get("/", infoController.getInfo);

router.get("/:id", infoController.getInfo);

// 후즈아트관련 요청을 받은경우에 사용합니다.
router.get("/whoseart", () => {});

// 교육, 모임, 특강에따라 해당되는 카드들을 리턴해야 합니다.
router.get("/:subCategory", () => {});

// 새로운 카드를 등록 또는 수정을 하는 경우 사용합니다.
router.post("/post", infoController.postCard);

router.delete("/:id", infoController.deleteInfo);

export default router;
