// 멘토가 정산을 요청하는 경우 여기로 요청합니다.
import express from 'express';
import { mentorController } from '../../controller/index.js';

const router = express.Router();

router.post('/', mentorController.settlementReq);

export default router;
