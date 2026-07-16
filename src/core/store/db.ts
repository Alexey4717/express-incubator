import mongoose from 'mongoose';

import { settings } from '../../app/settings/index';

export const runDB = async () => {
  const mongoUri = process.env.MONGO_URI || settings.MONGO_URI;
  const dbName = settings.DB_NAME;

  try {
    console.log('mongoUri: ', mongoUri);
    await mongoose.connect(mongoUri, { dbName });
    console.log('Connected successfully to mongo server');
  } catch (error) {
    console.error('Error connection to mongodb is occurred: ', error);
    await mongoose.disconnect();
  }
};
