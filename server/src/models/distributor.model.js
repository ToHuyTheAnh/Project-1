const mongoose = require('mongoose');

const DistributorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  parentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Distributor',
    default: null,
  },
  parentName: {
    type: String,
    default: null,
  },
  children: [
    {
      childrenId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Distributor', 
      },
      childrenName: {
        type: String,
        default: null,
      }
    }
  ],
  level: {
    type: Number,
  },
  groupNo: {
    type: Number,
  }
});

DistributorSchema.pre('updateOne', async function (next) {
  const update = this.getUpdate();
  if ( update.parentId !== undefined ) {
    if( update.parentId !== null ) {
      const distributorParent = await mongoose.model('Distributor').findById(update.parentId);
      update.parentName = distributorParent ? distributorParent.name : null;
    }
    else {
      update.parentName = null;
    }
  }
  next();
});

module.exports = mongoose.model('Distributor', DistributorSchema);
