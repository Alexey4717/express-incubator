import * as dotenv from "dotenv";
dotenv.config();

import {SettingsType} from "./types/common";

export const settings: SettingsType = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://0.0.0.0:27017',
    JWT_SECRET: process.env.JWT_SECRET || 'my_jwt_secret',
    REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || 'my_refresh_jwt_secret',
    DB_NAME: process.env.DB_NAME || "It-incubator-01-dev",
    ID_PATTERN_BY_DB_TYPE: '[0-9a-f]{24}',
    JWT_EXPIRATION: '10m',
    JWT_REFRESH_EXPIRATION: '24h',
};
