import { NextFunction, Request, Response } from 'express';

import { constants } from 'http2';

import {
  jwtService,
  securityDevicesQueryRepository,
  usersQueryRepository,
} from '../../app/composition-root';

export const cookieRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req?.cookies?.refreshToken;

    if (!refreshToken) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const { deviceId, userId } =
      (await jwtService.getDeviceAndUserIdsByRefreshToken(refreshToken)) || {};

    // проверка что токен валиден и не протух
    if (!userId || !deviceId) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    if (!req.context.user) {
      const foundUser = await usersQueryRepository.findUserById(userId);
      req.context.user = foundUser;
    }

    const foundSecurityDevice =
      await securityDevicesQueryRepository.findSecurityDeviceById(deviceId);

    if (!foundSecurityDevice) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    req.context.securityDevice = foundSecurityDevice;

    next();
  } catch (error) {
    console.log(`Auth middleware error is occurred: ${error}`);
  }
};
