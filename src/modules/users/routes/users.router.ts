import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '@/core/middlewares/paramId-validation-middleware';

import { USERS_ROUTES } from '../constants/users.paths';
import { UserControllers } from '../controllers/user-controllers';
import { createUserInputValidations } from '../validations/createVideoInputValidations';

export type UsersRouterDeps = {
  userControllers: UserControllers;
  adminBasicAuthMiddleware: RequestHandler;
};

export const createUsersRouter = ({
  userControllers,
  adminBasicAuthMiddleware,
}: UsersRouterDeps) => {
  const router = Router({});

  router.get(
    USERS_ROUTES.ROOT,
    adminBasicAuthMiddleware,
    userControllers.getUsers.bind(userControllers),
  );

  router.post(
    USERS_ROUTES.ROOT,
    adminBasicAuthMiddleware,
    createUserInputValidations,
    inputValidationsMiddleware,
    userControllers.createUser.bind(userControllers),
  );

  router.delete(
    USERS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    paramIdValidationMiddleware,
    userControllers.deleteUser.bind(userControllers),
  );

  return router;
};
