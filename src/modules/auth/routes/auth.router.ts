import { Router } from 'express';

import { authControllers } from '../../../app/composition-root';
import { authMiddleware } from '../../../core/middlewares/auth-middleware';
import { cookieRefreshTokenMiddleware } from '../../../core/middlewares/cookie-refresh-token-middleware';
import { inputValidationsMiddleware } from '../../../core/middlewares/input-validations-middleware';
import { rateLimitMiddleware } from '../../../core/middlewares/rate-limit-middleware';
import { AUTH_ROUTES } from '../constants/auth.paths';
import { loginInputValidations } from '../validations/auth/loginInputValidations';
import { newPasswordInputValidations } from '../validations/auth/newPasswordInputValidations';
import { passwordRecoveryInputValidations } from '../validations/auth/passwordRecoveryInputValidations';
import { registrationConfirmationInputValidations } from '../validations/auth/registrationConfirmationInputValidations';
import { registrationEmailResendingInputValidations } from '../validations/auth/registrationEmailResendingInputValidations';
import { registrationInputValidations } from '../validations/auth/registrationInputValidations';

export const authRouter = Router({});

authRouter.post(
  AUTH_ROUTES.LOGIN,
  rateLimitMiddleware,
  loginInputValidations,
  inputValidationsMiddleware,
  authControllers.login.bind(authControllers),
);
authRouter.post(
  AUTH_ROUTES.REFRESH_TOKEN,
  cookieRefreshTokenMiddleware,
  authControllers.refreshToken.bind(authControllers),
);
authRouter.post(
  AUTH_ROUTES.REGISTRATION,
  rateLimitMiddleware,
  registrationInputValidations,
  inputValidationsMiddleware,
  authControllers.registration.bind(authControllers),
);
authRouter.post(
  AUTH_ROUTES.REGISTRATION_CONFIRMATION,
  rateLimitMiddleware,
  registrationConfirmationInputValidations,
  inputValidationsMiddleware,
  authControllers.registrationConfirmation.bind(authControllers),
);
authRouter.post(
  AUTH_ROUTES.PASSWORD_RECOVERY,
  rateLimitMiddleware,
  passwordRecoveryInputValidations,
  inputValidationsMiddleware,
  authControllers.recoveryPassword.bind(authControllers),
);
authRouter.post(
  AUTH_ROUTES.NEW_PASSWORD,
  rateLimitMiddleware,
  newPasswordInputValidations,
  inputValidationsMiddleware,
  authControllers.newPassword.bind(authControllers),
);
authRouter.post(
  AUTH_ROUTES.REGISTRATION_EMAIL_RESENDING,
  rateLimitMiddleware,
  registrationEmailResendingInputValidations,
  inputValidationsMiddleware,
  authControllers.registrationEmailResending.bind(authControllers),
);
authRouter.post(
  AUTH_ROUTES.LOGOUT,
  cookieRefreshTokenMiddleware,
  authControllers.logout.bind(authControllers),
);

authRouter.get(
  AUTH_ROUTES.ME,
  authMiddleware,
  authControllers.getMe.bind(authControllers),
);
