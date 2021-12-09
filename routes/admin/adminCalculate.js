// 멘토 정산 관련 라우터

import express from 'express';
import { settlement } from '../../controller/admin/index.js';

const router = express.Router();

router.get('/', settlement.get);
router.post('/', settlement.post);

export default router;
