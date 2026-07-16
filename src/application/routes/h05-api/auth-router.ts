import {Router} from "express";

import {loginInputValidations} from "../../../validations/auth/loginInputValidations";
import {inputValidationsMiddleware} from "../../../middlewares/input-validations-middleware";
import {authMiddleware} from "../../../middlewares/auth-middleware";
import {registrationInputValidations} from "../../../validations/auth/registrationInputValidations";
import {
    registrationConfirmationInputValidations
} from "../../../validations/auth/registrationConfirmationInputValidations";
import {
    registrationEmailResendingInputValidations
} from "../../../validations/auth/registrationEmailResendingInputValidations";
import {authControllers} from "../../../controllers/auth-controllers";
import {cookieRefreshTokenMiddleware} from "../../../middlewares/cookie-refresh-token-middleware";
import {rateLimitMiddleware} from "../../../middlewares/rate-limit-middleware";
import {newPasswordInputValidations} from "../../../validations/auth/newPasswordInputValidations";
import {passwordRecoveryInputValidations} from "../../../validations/auth/passwordRecoveryInputValidations";


export const authRouter = Router({});

authRouter.post(
    '/login',
    rateLimitMiddleware,
    loginInputValidations,
    inputValidationsMiddleware,
    authControllers.login
);
authRouter.post(
    '/refresh-token',
    cookieRefreshTokenMiddleware,
    authControllers.refreshToken
);
authRouter.post(
    '/registration',
    rateLimitMiddleware,
    registrationInputValidations,
    inputValidationsMiddleware,
    authControllers.registration
);
authRouter.post(
    '/registration-confirmation',
    rateLimitMiddleware,
    registrationConfirmationInputValidations,
    inputValidationsMiddleware,
    authControllers.registrationConfirmation
);
authRouter.post(
    '/password-recovery',
    rateLimitMiddleware,
    passwordRecoveryInputValidations,
    inputValidationsMiddleware,
    authControllers.recoveryPassword
);
authRouter.post(
    '/new-password',
    rateLimitMiddleware,
    newPasswordInputValidations,
    inputValidationsMiddleware,
    authControllers.newPassword
);
authRouter.post(
    '/registration-email-resending',
    rateLimitMiddleware,
    registrationEmailResendingInputValidations,
    inputValidationsMiddleware,
    authControllers.registrationEmailResending
);
authRouter.post(
    '/logout',
    cookieRefreshTokenMiddleware,
    authControllers.logout
);

authRouter.get(
    '/me',
    authMiddleware,
    authControllers.getMe
);
