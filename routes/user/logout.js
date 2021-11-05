import express from 'express';

import { userController } from '../../controller/index.js';
const router = express.Router();

router.get('/', userController.logout);

export default router;
