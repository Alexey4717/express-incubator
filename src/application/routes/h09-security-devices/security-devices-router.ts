import {Router} from "express";

import {securityDeviceControllers} from "../../../controllers/security-device-controllers";
import {settings} from "../../../settings";
import {paramIdValidationMiddleware} from "../../../middlewares/paramId-validation-middleware";
import {cookieRefreshTokenMiddleware} from "../../../middlewares/cookie-refresh-token-middleware";


export const securityDevicesRouter = Router({});

securityDevicesRouter.get(
    '/',
    cookieRefreshTokenMiddleware,
    securityDeviceControllers.getSecurityDevices
);

securityDevicesRouter.delete(
    '/',
    cookieRefreshTokenMiddleware,
    securityDeviceControllers.deleteAllSecurityDevicesOmitCurrent
);

securityDevicesRouter.delete(
    `/:id(${settings.ID_PATTERN_BY_DB_TYPE})`,
    paramIdValidationMiddleware,
    // не вставляю мидлвэр, т.к. нужно отобразить 404 если не найден девайс
    // cookieRefreshTokenMiddleware,
    securityDeviceControllers.deleteSecurityDeviceById
);
