const mongoose = require('mongoose');

const Example = require('./example');

const models = {
  Example,
};

const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  retryWrites: false,
  useFindAndModify: false,
};

function connectDb(uri) {
  return mongoose.connect(uri, mongoConfig);
}

module.exports = {
  connectDb,
  models,
};
