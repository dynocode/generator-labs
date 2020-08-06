import mongoose from 'mongoose';

const models = {};

const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  retryWrites: false,
  useFindAndModify: false,
};

export function connectMongo(uri) {
  if (uri) {
    console.log('Running mongodb :', uri);
    return mongoose.connect(uri, mongoConfig);
  }

  if (process.env.TEST_DATABASE_URL) {
    console.log('Running mongodb :', process.env.TEST_DATABASE_URL);
    return mongoose.connect(process.env.TEST_DATABASE_URL, mongoConfig);
  }

  if (process.env.DATABASE_URL) {
    console.log('Connecting to mongoDB...');
    return mongoose.connect(process.env.DATABASE_URL, mongoConfig);
  }
  throw new BaseError('Unable to connect to mongo db, missing connection options');
}

export default models;
