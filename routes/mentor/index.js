import express from 'express';
import applyRouter from './apply.js';
import calculatorRouter from './calculate.js';

import { mentorController } from '../../controller/index.js';
const router = express.Router();

router.use('/apply', applyRouter);
router.use('/calculate', calculatorRouter);

router.get('/project', mentorController.getProject);

router.get('/', mentorController.getMentor);
router.get('/:id', mentorController.getMentor);
router.post('/', mentorController.modifiMentor);
router.put('/', mentorController.modifiMentor);

router.use('/*', (req, res) => res.status(404).send());

export default router;
