import { SettingsType } from '../../core/types/common';

export const settings: SettingsType = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://0.0.0.0:27017',
  ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET || 'my_access_jwt_secret',
  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || 'my_refresh_jwt_secret',
  DB_NAME: process.env.DB_NAME || 'express-incubator',
  ID_PATTERN_BY_DB_TYPE: '[0-9a-f]{24}',
  JWT_ACCESS_EXPIRATION: '10m',
  JWT_REFRESH_EXPIRATION: '24h',
  // TODO надо добавить IP_RESTRICTION_ENABLED
};
