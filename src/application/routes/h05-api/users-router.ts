import {Router} from "express";

import {adminBasicAuthMiddleware} from "../../../middlewares/admin-basicAuth-middleware";
import {paramIdValidationMiddleware} from "../../../middlewares/paramId-validation-middleware";
import {inputValidationsMiddleware} from "../../../middlewares/input-validations-middleware";
import {createUserInputValidations} from "../../../validations/user/createVideoInputValidations";
import {userControllers} from "../../../controllers/user-controllers";
import {settings} from "../../../settings";


export const usersRouter = Router({});

usersRouter.get(
    '/',
    adminBasicAuthMiddleware,
    userControllers.getUsers
);

usersRouter.post(
    '/',
    adminBasicAuthMiddleware,
    createUserInputValidations,
    inputValidationsMiddleware,
    userControllers.createUser
);

usersRouter.delete(
    `/:id(${settings.ID_PATTERN_BY_DB_TYPE})`,
    adminBasicAuthMiddleware,
    paramIdValidationMiddleware,
    userControllers.deleteUser
);
