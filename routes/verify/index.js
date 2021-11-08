import express from 'express';

import { userController } from '../../controller/index.js';
const router = express.Router();
// const { verifyEmail, retryVerify } = require("../../controller/user");

router.post('/email', userController.verifyEmail);

router.post('/retry', userController.retryVerify);

export default router;
