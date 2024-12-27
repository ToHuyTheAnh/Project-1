const distributorModel = require('../models/distributor.model');
const saleModel = require('../models/sale.model');
const _ = require('lodash');

const updateSale = async (saleId, saleData) => {
    return await saleModel.findOneAndUpdate(
        { _id: saleId },
        { $set: saleData },
        { new: true }
    );
}

const getSalesInBatch = async () => {
    const sales = await saleModel.find();
    const saleKeyByIds = _.keyBy(sales, 'distributorId');
    const distributors = await distributorModel.find();
    const distributorKeyByIds = _.keyBy(distributors, '_id');

    const salesInBatch = []; 
    for (const sale of sales) {
        const distributor = distributorKeyByIds[sale.distributorId];
        const distributorChidren = _.get(distributor, 'children', []);
        sale.commissionFromChildren = 0;
        for (const distributorChild of distributorChidren) {
            const saleOfChild = saleKeyByIds[distributorChild.childrenId];
            sale.commissionFromChildren += saleOfChild.revenue / 100;
        }
        sale.commissionFromRevenue = sale.revenue / 10;
        sale.totalIncome = sale.revenue + sale.commissionFromRevenue + sale.commissionFromChildren;
        await saleModel.findByIdAndUpdate(
            sale._id,
            { $set: sale },
            { new: true }
        );
        salesInBatch.push({
            sale,
            distributor,
        });
    }
    return salesInBatch;
}

module.exports = {
    updateSale,
    getSalesInBatch,
}