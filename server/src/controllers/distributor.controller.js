const distributorService = require('../services/distributor.service');

const createDistributor = (req, res) => {
  distributorService.createDistributor(req.body)
    .then((newDistributor) => {
      return res.status(200).json({
        message: 'Nhà phân phối tạo thành công',
        distributor: newDistributor,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        message: error.message,
      });
    });
};

const getDistributorById = (req, res) => {
  distributorService.getDistributorById(req.params.id)
    .then((distributor) => {
      return res.status(200).json({
        message: 'Lấy thông tin nhà phân phối thành công',
        distributor: distributor,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        message: error.message,
      });
    });
};

const getAllDistributors = (req, res) => {
  distributorService.getAllDistributors()
    .then((distributors) => {
      return res.status(200).json({
        message: 'Lấy thông tin các nhà phân phối thành công',
        distributors: distributors,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        message: error.message,
      });
    });
};

const deleteDistributorById = (req, res) => {
  distributorService.deleteDistributorById(req.params.id)
    .then(() => {
      return res.status(200).json({
        message: 'Xóa nhà phân phối thành công',
      });
    })
    .catch((error) => {
      return res.status(400).json({
        message: error.message,
      });
    });
};


module.exports = {
  createDistributor,
  getDistributorById,
  getAllDistributors,
  deleteDistributorById,
};
