const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  distributorId: {
    type: mongoose.Schema.ObjectId,
    require: true,
  },
  revenue: {
    type: Number,
    default: 0,
    min: [0, 'Doanh thu không thể âm']
  },
  commissionFromRevenue: {
    type: Number,
    default: 0,
  },
  commissionFromChildren: {
    type: Number,
    default: 0,
  },
  totalIncome: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Sale', SaleSchema);
