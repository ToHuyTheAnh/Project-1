const { defaultTo } = require('lodash');
const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  batchNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  saleList: [
    {
        distributorName: {
            type: String,
        },
        parentName: {
            type: String,
            default: null,
        },
        children: [
            {
                childrenName: {
                    type: String,
                }
            }
        ],
        level: {
            type: Number,
        },
        groupNo: {
            type: Number,
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
    },
  ],
  totalInBatch: {
    type: Number,
    default: 0,
  },
  isSave: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Batch', BatchSchema);
