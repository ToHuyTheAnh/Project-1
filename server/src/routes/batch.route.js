const express = require('express');
const router = express.Router();
const {
    createBatch,
    saveBatch,
    getBatches,
    getBatchesByDate,
    getNewestBatch,
    deleteBatch,
} = require('../controllers/batch.controller');

router.post('/create', createBatch);

router.patch('/save/:id', saveBatch);

router.post('/getBatches', getBatches);

router.post('/getBatchesByDate', getBatchesByDate);

router.get('/getNewestBatch', getNewestBatch);

router.delete('/:id', deleteBatch);

module.exports = router;