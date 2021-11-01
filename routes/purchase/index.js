import express from "express";
const router = express.Router();

// const { userController } = require("../../controller");
import userController from "../../controller/index.js";
// 결제 완료이후 데이터 검증
router.post("/payment", userController.payment.post);

// 결제 취소 핸들러
router.post("/refund", userController.payment.revoke);

// 결제 실패시 디비 내역 삭제
router.delete("/payment/:merchantUid", userController.payment.remove);

// 멘토링 등록 핸들러
router.post("/questions", userController.postQuestions);

router.post("/", userController.postPurchase);
router.get("/:id", userController.getPurchase);
router.get("/", userController.getPurchase);

router.use("/*", (req, res) => {
  res.status(404).send();
});

export default router;
