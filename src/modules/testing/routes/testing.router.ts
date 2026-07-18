import { Router } from 'express';

import { TESTING_ROUTES } from '../constants/testing.paths';
import { TestingControllers } from '../controllers/testing-controllers';

export type TestingRouterDeps = {
  testingControllers: TestingControllers;
};

export const createTestingRouter = ({
  testingControllers,
}: TestingRouterDeps) => {
  const router = Router({});

  router.delete(
    TESTING_ROUTES.ALL_DATA,
    testingControllers.deleteAllData.bind(testingControllers),
  );

  router.post(
    TESTING_ROUTES.MIGRATE_LIKES,
    testingControllers.migrateLikes.bind(testingControllers),
  );

  return router;
};
