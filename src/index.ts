// sort-imports-ignore
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { app } from './app/app';
import { runDB } from './core/store/db';

const port = process.env.PORT || 3001;

const startApp = async () => {
  await runDB().catch(console.dir);
  app.listen(port, () => {
    console.log(`server running on ${port} port`);
  });
};

if (require.main === module) {
  startApp();
}
