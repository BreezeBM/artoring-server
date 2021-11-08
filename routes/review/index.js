import express from 'express';

import { reviewController } from '../../controller/index.js';
const router = express.Router();

router.get('/:cardids', reviewController.getReview);
router.post('/', reviewController.postReview);
router.put('/', () => {});
router.delete('/', () => {});

export default router;
