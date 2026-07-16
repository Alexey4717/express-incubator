import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { rateLimitMiddleware } from '@/core/middlewares/rate-limit-middleware';

import { AUTH_ROUTES } from '../constants/auth.paths';
import { AuthControllers } from '../controllers/auth-controllers';
import { AuthValidations } from '../validations/auth-shared-validators';

export type AuthRouterDeps = {
  authControllers: AuthControllers;
  authMiddleware: RequestHandler;
  cookieRefreshTokenMiddleware: RequestHandler;
  validations: AuthValidations;
};

export const createAuthRouter = ({
  authControllers,
  authMiddleware,
  cookieRefreshTokenMiddleware,
  validations,
}: AuthRouterDeps) => {
  const router = Router({});

  router.post(
    AUTH_ROUTES.LOGIN,
    rateLimitMiddleware,
    validations.loginInputValidations,
    inputValidationsMiddleware,
    authControllers.login.bind(authControllers),
  );
  router.post(
    AUTH_ROUTES.REFRESH_TOKEN,
    cookieRefreshTokenMiddleware,
    authControllers.refreshToken.bind(authControllers),
  );
  router.post(
    AUTH_ROUTES.REGISTRATION,
    rateLimitMiddleware,
    validations.registrationInputValidations,
    inputValidationsMiddleware,
    authControllers.registration.bind(authControllers),
  );
  router.post(
    AUTH_ROUTES.REGISTRATION_CONFIRMATION,
    rateLimitMiddleware,
    validations.registrationConfirmationInputValidations,
    inputValidationsMiddleware,
    authControllers.registrationConfirmation.bind(authControllers),
  );
  router.post(
    AUTH_ROUTES.PASSWORD_RECOVERY,
    rateLimitMiddleware,
    validations.passwordRecoveryInputValidations,
    inputValidationsMiddleware,
    authControllers.recoveryPassword.bind(authControllers),
  );
  router.post(
    AUTH_ROUTES.NEW_PASSWORD,
    rateLimitMiddleware,
    validations.newPasswordInputValidations,
    inputValidationsMiddleware,
    authControllers.newPassword.bind(authControllers),
  );
  router.post(
    AUTH_ROUTES.REGISTRATION_EMAIL_RESENDING,
    rateLimitMiddleware,
    validations.registrationEmailResendingInputValidations,
    inputValidationsMiddleware,
    authControllers.registrationEmailResending.bind(authControllers),
  );
  router.post(
    AUTH_ROUTES.LOGOUT,
    cookieRefreshTokenMiddleware,
    authControllers.logout.bind(authControllers),
  );

  router.get(
    AUTH_ROUTES.ME,
    authMiddleware,
    authControllers.getMe.bind(authControllers),
  );

  return router;
};
