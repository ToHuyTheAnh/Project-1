const batchService = require('../services/batch.service');

const createBatch = (req, res) => {
    batchService.createBatch()
    .then((batch) => {
        return res.status(200).json({
            message: `Tạo bảng thống kê doanh số mới thàng công`,
            batch: batch,
        });
    })
    .catch((error) => {
        return res.status(400).json({
            message: error.message,
        });
    });
}

const saveBatch = (req, res) => {
    batchService.saveBatch(req.params.id)
    .then((batch) => {
        return res.status(200).json({
            message: `Lưu bảng thống kê doanh số thành công`,
            batch: batch,
        });
    })
    .catch((error) => {
        return res.status(400).json({
            message: error.message,
        });
    });
}

const getBatches = (req, res) => {
    batchService.getBatches(req.body)
    .then((batches) => {
        return res.status(200).json({
            message: `Thống kê doanh số các đợt thành công`,
            batches: batches,
        });
    })
    .catch((error) => {
        return res.status(400).json({
            message: error.message,
        });
    });
}

const getBatchesByDate = (req, res) => {
    batchService.getBatchesByDate(req.body)
    .then((batches) => {
        return res.status(200).json({
            message: `Thống kê doanh số các đợt thành công`,
            batches: batches,
        });
    })
    .catch((error) => {
        return res.status(400).json({
            message: error.message,
        });
    });
}

const getNewestBatch = (req, res) => {
    batchService.getNewestBatch()
    .then((batch) => {
        return res.status(200).json({
            message: `Tải thống kê doanh số đợt mới nhất thành công`,
            batch: batch,
        });
    })
    .catch((error) => {
        return res.status(400).json({
            message: error.message,
        });
    });
}

const deleteBatch = (req, res) => {
    batchService.deleteBatch(req.params.id)
    .then(() => {
        return res.status(200).json({
            message: `Hủy bảng thống kê doanh số thành công`,
        });
    })
    .catch((error) => {
        return res.status(400).json({
            message: error.message,
        });
    });
}

module.exports = {
    createBatch,
    saveBatch,
    getBatches,
    getBatchesByDate,
    getNewestBatch,
    deleteBatch,
}