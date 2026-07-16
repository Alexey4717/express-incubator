import { Router } from 'express';

import { securityDeviceControllers } from '../../../app/composition-root';
import { cookieRefreshTokenMiddleware } from '../../../core/middlewares/cookie-refresh-token-middleware';
import { paramIdValidationMiddleware } from '../../../core/middlewares/paramId-validation-middleware';
import { SECURITY_DEVICES_ROUTES } from '../constants/security-devices.paths';

export const securityDevicesRouter = Router({});

securityDevicesRouter.get(
  SECURITY_DEVICES_ROUTES.ROOT,
  cookieRefreshTokenMiddleware,
  securityDeviceControllers.getSecurityDevices.bind(securityDeviceControllers),
);

securityDevicesRouter.delete(
  SECURITY_DEVICES_ROUTES.ROOT,
  cookieRefreshTokenMiddleware,
  securityDeviceControllers.deleteAllSecurityDevicesOmitCurrent.bind(
    securityDeviceControllers,
  ),
);

securityDevicesRouter.delete(
  SECURITY_DEVICES_ROUTES.BY_ID,
  paramIdValidationMiddleware,
  // не вставляю мидлвэр, т.к. нужно отобразить 404 если не найден девайс
  // cookieRefreshTokenMiddleware,
  securityDeviceControllers.deleteSecurityDeviceById.bind(
    securityDeviceControllers,
  ),
);
