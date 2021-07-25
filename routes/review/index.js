const express = require('express');
const router = express.Router();

const reviewController = require('../../controller/review');

router.get('/:cardids', reviewController.getReview);
router.post('/', reviewController.postReview);
router.put('/', () => {});
router.delete('/', () => {});

module.exports = router;
