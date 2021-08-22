const express = require('express');
const router = express.Router();
const applyRouter = require('./apply');
const calculatorRouter = require('./calculate');

const mentorController = require('../../controller/mentor');

router.use('/apply', applyRouter);
router.use('/calculate', calculatorRouter);
router.get('/', mentorController.getMentor);
router.get('/:id', mentorController.getMentor);

router.use('/*', (req, res) => res.status(404).send());

module.exports = router
;
