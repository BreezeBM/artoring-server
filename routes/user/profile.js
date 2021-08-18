const express = require("express");
const router = express.Router();
const { userController } = require("../../controller");

// 마이페이지에 접근하기 전에 한번더 비밀번호를 체크하는 로직, 와이어에는 없지만 혹시나 해서 넣었습니다
router.get("/password/check", () => {});

// 비밀번호를 변경할때 사용합니다.
router.put("/password/mod", userController.passwordMod);

// 유저 개인정보를 요청할때 사용합니다.
router.get("/", userController.getProfile);

// 비밀번호를 제외한 다른 개인정보가 변경되었을 경우 사용합니다.
router.put("/", userController.putProfile);

module.exports = router;
