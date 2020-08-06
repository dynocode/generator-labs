import mongoose from 'mongoose';

const model = new mongoose.Schema(
  {
    name: {
      type: String,
      required: '{PATH} is required!',
    },
    description: {
      type: String,
      required: '{PATH} is required!',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    q: [String],
  },
  {
    timestamps: true,
  },
);

const Model = mongoose.model('Example', model);

export default Model;
