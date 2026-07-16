import express from 'express';

import { setupApp } from './setup-app';

export const app = express();

setupApp(app);
