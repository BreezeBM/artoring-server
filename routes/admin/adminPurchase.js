import express from 'express';

import { adminController } from '../../controller/index.js';
const router = express.Router();

router.get('/:id', adminController.getPurchase);
router.get('/', adminController.getPurchase);
router.post('/', adminController.putPurchase);

export default router;
