const distributorModel = require('../models/distributor.model');
const _ = require('lodash');
const saleModel = require('../models/sale.model');

const _findDistributorParent = async (distributorParent) => {
  const queue = [];
  queue.push(distributorParent);
  while (queue.length > 0) {
    const distributorCurrent = queue.shift();
    const distributorChildren = _.get(distributorCurrent, 'children', []);
    if (_.size(distributorChildren) < 2 && _.get(distributorCurrent, 'level') < 5)
      return distributorCurrent;
    for (const distributorChild of distributorChildren) {
      const distributorNext = await distributorModel.findById(distributorChild.childrenId);
      queue.push(distributorNext);
    }
  }
  return null;
};

const _getNewGroupNo = async () => {
  const usedGroupNos = await distributorModel.distinct('groupNo');
  let groupNo = 1;
  while (usedGroupNos.includes(groupNo)) {
    groupNo++;
  }
  return groupNo;
}

const createDistributor = async (distributorData) => {
  const distributor = await distributorModel.findOne({
    name: distributorData.name,
  });
  if (distributor) {
    throw new Error('Nhà phân phối đã tồn tại');
  }

  const newGroupNo = await _getNewGroupNo();
  let newDistributor;

  if (!distributorData.parentId) {
    newDistributor = await distributorModel.create({
      ...distributorData,
      level: 1,
      groupNo: newGroupNo,
    });
    await saleModel.create({ distributorId: newDistributor._id });
    return newDistributor
  }

  const distributorParent = await distributorModel.findOne({
    _id: distributorData.parentId,
  });
  if (!distributorParent) {
    throw new Error('Nhà phân phối cấp trên không còn tồn tại');
  }

  const newDistributorParent = await _findDistributorParent(distributorParent);
  
  if (!newDistributorParent) {
    newDistributor = await distributorModel.create({
      ...distributorData,
      level: 1,
      parentId: null,
      groupNo: newGroupNo,
    });
  } else {
    newDistributor = await distributorModel.create({
      ...distributorData,
      level: _.get(newDistributorParent, 'level', 0) + 1,
      groupNo: _.get(newDistributorParent, 'groupNo', 1),
      parentId: _.get(newDistributorParent, '_id', null),
      parentName: _.get(newDistributorParent, 'name', null),
    });
    newDistributorParent.children.push({
      childrenId: newDistributor._id,
      childrenName: newDistributor.name
    });
    await newDistributorParent.save();
  }

  await saleModel.create({ distributorId: newDistributor._id });
  return newDistributor;
};

const getDistributorById = async (distributorId) => {
  const distributor = await distributorModel.findOne({ _id: distributorId });
  if (!distributor) {
    throw new Error('Nhà phân phối không tồn tại');
  }
  return distributor;
};

const getAllDistributors = async () => {
  return await distributorModel.find().sort({ groupNo: 1, level: 1 });
};


const _refactorDistributor = async (distributorId, isShiftDistributorUp) => {
  const distributor = await distributorModel.findById(distributorId);
  const distributorChildren = _.get(distributor, 'children', []);
  const numChildren = _.size(distributorChildren);

  await distributorModel.updateOne(
      { _id: distributorId },
      { $inc: { level: -1 } }
  );

  if (numChildren == 0) return;

  if (numChildren == 1)
    isShiftDistributorUp |= 1;
  
  // Trường hợp chỉ cần đẩy toàn bộ nhà phân phối dưới lên 1 bậc
  if(isShiftDistributorUp) {
    for(const distributorChild of distributorChildren) {
      const distributorChildId = _.get(distributorChild, 'childrenId');
      _refactorDistributor(distributorChildId, isShiftDistributorUp); 
    }
    return ;
  }

  // Nhà phân phối dưới thứ 2 được chọn để thay thế
  const distributorChildSelected = _.get(distributorChildren, 1);

  await _refactorDistributor(distributorChildSelected.childrenId, isShiftDistributorUp);

  if (numChildren == 2) {
    // Nhà phân phối dưới còn lại
    const distributorChildNotSelected = _.get(distributorChildren, 0);

    await distributorModel.updateOne(
      { _id: distributorId },
      { $pull: { children: distributorChildNotSelected } }
    );

    await distributorModel.updateOne(
      { _id: distributorChildNotSelected.childrenId },
      { parentId: distributorChildSelected.childrenId }
    );

    await distributorModel.updateOne(
      { _id: distributorChildSelected.childrenId }, 
      { $push: { children: distributorChildNotSelected } }
    );
  }
};

const _deleteNeededDistributor = async (distributorId) => {
  const distributor = await distributorModel.findById(distributorId); 
  const distributorParentId = _.get(distributor, 'parentId', null);
  const distributorChildren = _.get(distributor, 'children', []);
  const distributorChildSelected = _.get(distributorChildren, _.size(distributorChildren) - 1, null);

  if (distributorParentId && distributorChildSelected) {  // Nối trên dưới
      await distributorModel.updateOne(
        { _id: distributorParentId },
        { $pull: { 
            children: { 
              childrenId: distributor._id,
              childrenName: distributor.name
            } 
          }
        },
      );

      await distributorModel.updateOne(
        { _id: distributorParentId },
        { $push: { children: distributorChildSelected } },
      );

      await distributorModel.updateOne(
        { _id: distributorChildSelected.childrenId },
        { parentId: distributorParentId }
      );

    } else if (distributorChildSelected) { // Có dưới ko trên 
      await distributorModel.updateOne(
        { _id: distributorChildSelected.childrenId },
        { 
          parentId: null, 
          parentName: null,
        }
      )
    } else if (distributorParentId) { // Có trên không dưới
      await distributorModel.updateOne(
        { _id: distributorParentId },
        { $pull: { 
            children: { 
              childrenId: distributor._id,
              childrenName: distributor.name
            } 
          }
        },
      );
    }
  await distributorModel.deleteOne({ _id: distributorId });
}

const deleteDistributorById = async (distributorId) => {
  const distributor = await distributorModel.findOne({ _id: distributorId });
  if (!distributor) {
    throw new Error('Nhà phân phối không tồn tại');
  }
  // Tái cấu trúc các nhà phân phối ở dưới
  await _refactorDistributor(distributorId, 0);

  // Xóa nhà phân phối cần xóa và nối nhà phân phối dưới nó với nhà phân phối trên nó nếu có
  await _deleteNeededDistributor(distributorId);

  await saleModel.deleteOne({ distributorId: distributorId });
};

module.exports = {
  createDistributor,
  getDistributorById,
  getAllDistributors,
  deleteDistributorById,
};
