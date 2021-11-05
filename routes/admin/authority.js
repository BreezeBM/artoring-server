import express from 'express';

import { adminController } from '../../controller/index.js';
const router = express.Router();

router.use('/login', adminController.login);
router.use('/logout', adminController.logout);
router.use('/signup', adminController.singup);

export default router;
