import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import {
  paginationAndSortingValidation,
  usersSearchValidation,
} from '@/core/middlewares/query-pagination-sorting.validation.middleware';
import { mongoIdParamValidation } from '@/core/validations/common';

import { USERS_ROUTES } from '../constants/users.paths';
import { UserControllers } from '../controllers/user-controllers';
import { SORT_USERS_FIELDS } from '../models/GetUsersInputModel';
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
    ...paginationAndSortingValidation(SORT_USERS_FIELDS),
    ...usersSearchValidation(),
    inputValidationsMiddleware,
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
    mongoIdParamValidation('id'),
    inputValidationsMiddleware,
    userControllers.deleteUser.bind(userControllers),
  );

  return router;
};
