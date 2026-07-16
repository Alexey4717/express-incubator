import { Router } from 'express';

import { authControllers } from '../../../controllers/auth-controllers';
import { authMiddleware } from '../../../middlewares/auth-middleware';
import { cookieRefreshTokenMiddleware } from '../../../middlewares/cookie-refresh-token-middleware';
import { inputValidationsMiddleware } from '../../../middlewares/input-validations-middleware';
import { rateLimitMiddleware } from '../../../middlewares/rate-limit-middleware';
import { loginInputValidations } from '../../../validations/auth/loginInputValidations';
import { newPasswordInputValidations } from '../../../validations/auth/newPasswordInputValidations';
import { passwordRecoveryInputValidations } from '../../../validations/auth/passwordRecoveryInputValidations';
import { registrationConfirmationInputValidations } from '../../../validations/auth/registrationConfirmationInputValidations';
import { registrationEmailResendingInputValidations } from '../../../validations/auth/registrationEmailResendingInputValidations';
import { registrationInputValidations } from '../../../validations/auth/registrationInputValidations';

export const authRouter = Router({});

authRouter.post(
  '/login',
  rateLimitMiddleware,
  loginInputValidations,
  inputValidationsMiddleware,
  authControllers.login,
);
authRouter.post(
  '/refresh-token',
  cookieRefreshTokenMiddleware,
  authControllers.refreshToken,
);
authRouter.post(
  '/registration',
  rateLimitMiddleware,
  registrationInputValidations,
  inputValidationsMiddleware,
  authControllers.registration,
);
authRouter.post(
  '/registration-confirmation',
  rateLimitMiddleware,
  registrationConfirmationInputValidations,
  inputValidationsMiddleware,
  authControllers.registrationConfirmation,
);
authRouter.post(
  '/password-recovery',
  rateLimitMiddleware,
  passwordRecoveryInputValidations,
  inputValidationsMiddleware,
  authControllers.recoveryPassword,
);
authRouter.post(
  '/new-password',
  rateLimitMiddleware,
  newPasswordInputValidations,
  inputValidationsMiddleware,
  authControllers.newPassword,
);
authRouter.post(
  '/registration-email-resending',
  rateLimitMiddleware,
  registrationEmailResendingInputValidations,
  inputValidationsMiddleware,
  authControllers.registrationEmailResending,
);
authRouter.post(
  '/logout',
  cookieRefreshTokenMiddleware,
  authControllers.logout,
);

authRouter.get('/me', authMiddleware, authControllers.getMe);
