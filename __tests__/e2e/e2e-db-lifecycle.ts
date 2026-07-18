import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { settings } from '@/core/settings/index';

let mongoMemoryServer: MongoMemoryServer;

export const setupE2eDb = (timeout = 10000) => {
  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    process.env['MONGO_URI'] = mongoMemoryServer.getUri();
    await mongoose.connect(process.env['MONGO_URI']!, {
      dbName: settings.DB_NAME,
    });
  }, timeout);

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoMemoryServer?.stop();
  });
};
