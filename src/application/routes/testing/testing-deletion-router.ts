import { Router } from 'express';

import { testingControllers } from '../../../controllers/testing-controllers';

export const testingDeletionRouter = Router({});

// clear all resources data for testing, OMIT USERS in mocked db!!
testingDeletionRouter.delete('/all-data', testingControllers.deleteAllData);
