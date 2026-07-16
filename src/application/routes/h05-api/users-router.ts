import { Router } from 'express';

import { userControllers } from '../../../controllers/user-controllers';
import { adminBasicAuthMiddleware } from '../../../middlewares/admin-basicAuth-middleware';
import { inputValidationsMiddleware } from '../../../middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../middlewares/paramId-validation-middleware';
import { createUserInputValidations } from '../../../validations/user/createVideoInputValidations';

export const usersRouter = Router({});

usersRouter.get('/', adminBasicAuthMiddleware, userControllers.getUsers);

usersRouter.post(
  '/',
  adminBasicAuthMiddleware,
  createUserInputValidations,
  inputValidationsMiddleware,
  userControllers.createUser,
);

usersRouter.delete(
  '/:id',
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  userControllers.deleteUser,
);
