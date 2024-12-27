const _ = require('lodash');
const batchModel = require('../models/batch.model');
const saleModel = require('../models/sale.model');
const distributorModel = require('../models/distributor.model');

const createBatch = async () => {
    const countBatch = await batchModel.countDocuments();
    await saleModel.updateMany(
        {},
        { 
            $set: { 
                revenue: 0,
                commissionFromRevenue: 0,
                commissionFromChildren: 0 
            }
        }
    );
    return batchModel.create({
        batchNumber: countBatch + 1,
    })
    
}

const saveBatch = async (batchId) => {
    const sales = await saleModel.find();
    let saleList = [];
    let totalInBatch = 0;
    for(const sale of sales) {
        const distributor = await distributorModel.findById(sale.distributorId);
        const saleData = {
            distributorName: _.get(distributor, 'name'),
            parentName: _.get(distributor, 'parentName', null),
            children: _.map(_.get(distributor, 'children', []), item => ({ childrenName: item.childrenName })),
            level: _.get(distributor, 'level'),
            groupNo: _.get(distributor, 'groupNo'),
            revenue: _.get(sale, 'revenue'),
            commissionFromRevenue: _.get(sale, 'commissionFromRevenue'),
            commissionFromChildren: _.get(sale, 'commissionFromChildren'),
            totalIncome: _.get(sale, 'totalIncome'),
        }
        totalInBatch += _.get(sale, 'totalIncome');
        saleList.push(saleData);
    }
    return await batchModel.findByIdAndUpdate(
        { _id: batchId },
        {
            $set: {
                saleList: saleList,
                totalInBatch,
                isSave: true,
            },
        },
        { new: true }
    );
}

const getBatches = async (request) => {
    const { from, to } = request;
    if(from > to || from < 1 || to < 1) {
        throw new Error('Tìm kiếm không hợp lệ');
    }
    return await batchModel.find({
        batchNumber: { $gte: from, $lte: to },
    }).sort({ batchNumber: -1 });
}

const getBatchesByDate = async (request) => {
    const { from, to } = request;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    if (isNaN(fromDate) || isNaN(toDate)) {
        throw new Error('Định dạng ngày không hợp lệ');
    }
    
    if(fromDate > toDate) {
        throw new Error('Tìm kiếm không hợp lệ');
    }
    return await batchModel.find({
        createdAt: { $gte: fromDate, $lte: toDate },
    }).sort({ createdAt: -1 });
}

const getNewestBatch = async () => {
    return await batchModel.findOne().sort({ batchNumber: -1 }).exec()
}

const deleteBatch = async (batchId) => {
    await batchModel.findByIdAndDelete(batchId);
}

module.exports = {
    createBatch,
    saveBatch,
    getBatches,
    getBatchesByDate,
    getNewestBatch,
    deleteBatch,
}

