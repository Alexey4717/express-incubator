import { Router } from 'express';

import { userControllers } from '../../../app/composition-root';
import { adminBasicAuthMiddleware } from '../../../core/middlewares/admin-basicAuth-middleware';
import { inputValidationsMiddleware } from '../../../core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../core/middlewares/paramId-validation-middleware';
import { USERS_ROUTES } from '../constants/users.paths';
import { createUserInputValidations } from '../validations/user/createVideoInputValidations';

export const usersRouter = Router({});

usersRouter.get(
  USERS_ROUTES.ROOT,
  adminBasicAuthMiddleware,
  userControllers.getUsers.bind(userControllers),
);

usersRouter.post(
  USERS_ROUTES.ROOT,
  adminBasicAuthMiddleware,
  createUserInputValidations,
  inputValidationsMiddleware,
  userControllers.createUser.bind(userControllers),
);

usersRouter.delete(
  USERS_ROUTES.BY_ID,
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  userControllers.deleteUser.bind(userControllers),
);
