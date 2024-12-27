const express = require('express');
const { updateSale, getSalesInBatch } = require('../controllers/sale.controller');
const router = express.Router();

router.patch('/:id', updateSale);

router.get('/', getSalesInBatch);

module.exports = router;