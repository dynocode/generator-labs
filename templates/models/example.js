const mongoose = require('mongoose');

const mongoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: '{PATH} is required!',
    },
    value: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const mongoModel = mongoose.model('Example', mongoSchema);

module.exports = mongoModel;
