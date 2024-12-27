const express = require('express');
const router = express.Router();
const {
  createDistributor,
  getDistributorById,
  getAllDistributors,
  deleteDistributorById,
} = require('../controllers/distributor.controller');

router.post('/create', createDistributor);

router.get('/:id', getDistributorById);

router.get('/', getAllDistributors);

router.delete('/:id', deleteDistributorById);

module.exports = router;
