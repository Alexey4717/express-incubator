import { RequestHandler, Router } from 'express';

import { paramIdValidationMiddleware } from '@/core/middlewares/paramId-validation-middleware';

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
    paramIdValidationMiddleware,
    securityDeviceControllers.deleteSecurityDeviceById.bind(
      securityDeviceControllers,
    ),
  );

  return router;
};
