const saleService = require('../services/sale.service');

const updateSale = (req, res) => {
    saleService.updateSale(req.params.id, req.body)
    .then((updatedSale) => {
        return res.status(200).json({
            message: `Cập nhật thông tin về doanh số thành công`,
            sale: updatedSale,
        });
    })
    .catch((error) => {
        return res.status(400).json({
            message: error.message,
        });
    });
}

const getSalesInBatch = (req, res) => {
    saleService.getSalesInBatch()
    .then((saleInBatch) => {
        return res.status(200).json({
            message: `Lấy thông tin về doanh số thành công`,
            report: saleInBatch,
        });
    })
    .catch((error) => {
        return res.status(400).json({
            message: error.message,
        });
    });
}

module.exports = {
    updateSale,
    getSalesInBatch,
}