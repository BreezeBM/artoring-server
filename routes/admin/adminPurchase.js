const express = require('express');
const router = express.Router();

const adminController = require('../../controller/admin');

router.get('/:id', adminController.getPurchase);
router.get('/', adminController.getPurchase);
router.post('/', adminController.putPurchase);

module.exports = router;
