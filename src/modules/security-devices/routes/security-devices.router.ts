import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { mongoIdParamValidation } from '@/core/validations/common';

import { SECURITY_DEVICES_ROUTES } from '../constants/security-devices.paths';
import { SecurityDeviceControllers } from '../controllers/security-device-controllers';

export type SecurityDevicesRouterDeps = {
  securityDeviceControllers: SecurityDeviceControllers;
  cookieRefreshTokenMiddleware: RequestHandler;
};

export const createSecurityDevicesRouter = ({
  securityDeviceControllers,
  cookieRefreshTokenMiddleware,
}: SecurityDevicesRouterDeps) => {
  const router = Router({});

  router.get(
    SECURITY_DEVICES_ROUTES.ROOT,
    cookieRefreshTokenMiddleware,
    securityDeviceControllers.getSecurityDevices.bind(
      securityDeviceControllers,
    ),
  );

  router.delete(
    SECURITY_DEVICES_ROUTES.ROOT,
    cookieRefreshTokenMiddleware,
    securityDeviceControllers.deleteAllSecurityDevicesOmitCurrent.bind(
      securityDeviceControllers,
    ),
  );

  router.delete(
    SECURITY_DEVICES_ROUTES.BY_ID,
    mongoIdParamValidation('id'),
    inputValidationsMiddleware,
    cookieRefreshTokenMiddleware,
    securityDeviceControllers.deleteSecurityDeviceById.bind(
      securityDeviceControllers,
    ),
  );

  return router;
};
