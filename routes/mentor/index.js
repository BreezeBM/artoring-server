const express = require('express');
const router = express.Router();
const applyRouter = require('./apply');
const calculatorRouter = require('./calculate');

router.use('/apply', applyRouter);
router.use('/calculate', calculatorRouter);

router.use('/*', (req, res) => res.status(404).send());
