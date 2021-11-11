import express from 'express';
import { adminController } from '../../controller/index.js';

const router = express.Router();

router.get('/', adminController.getDrop);
router.post('/', adminController.setDrop);

export default router;
