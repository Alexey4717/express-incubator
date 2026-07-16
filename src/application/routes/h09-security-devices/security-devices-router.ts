import { Router } from 'express';

import { securityDeviceControllers } from '../../../controllers/security-device-controllers';
import { cookieRefreshTokenMiddleware } from '../../../middlewares/cookie-refresh-token-middleware';
import { paramIdValidationMiddleware } from '../../../middlewares/paramId-validation-middleware';

export const securityDevicesRouter = Router({});

securityDevicesRouter.get(
  '/',
  cookieRefreshTokenMiddleware,
  securityDeviceControllers.getSecurityDevices,
);

securityDevicesRouter.delete(
  '/',
  cookieRefreshTokenMiddleware,
  securityDeviceControllers.deleteAllSecurityDevicesOmitCurrent,
);

securityDevicesRouter.delete(
  '/:id',
  paramIdValidationMiddleware,
  // не вставляю мидлвэр, т.к. нужно отобразить 404 если не найден девайс
  // cookieRefreshTokenMiddleware,
  securityDeviceControllers.deleteSecurityDeviceById,
);
