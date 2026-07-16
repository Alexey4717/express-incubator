import { Router } from 'express';

import { testingControllers } from '../../../app/composition-root';
import { TESTING_ROUTES } from '../constants/testing.paths';

export const testingRouter = Router({});

testingRouter.delete(
  TESTING_ROUTES.ALL_DATA,
  testingControllers.deleteAllData.bind(testingControllers),
);
