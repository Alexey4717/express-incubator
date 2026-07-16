import { NextFunction, Request, Response } from 'express';

import { constants } from 'http2';
import { ObjectId } from 'mongodb';

import { JwtService } from '../application/jwt-service';
import { RequestContextType } from '../types/common';

export type CookieRefreshTokenMiddlewareDeps = {
  jwtService: JwtService;
  usersQueryRepository: {
    findUserById: (userId: ObjectId) => Promise<RequestContextType['user']>;
  };
  securityDevicesQueryRepository: {
    findSecurityDeviceById: (
      deviceId: ObjectId,
    ) => Promise<RequestContextType['securityDevice']>;
  };
};

export const createCookieRefreshTokenMiddleware =
  ({
    jwtService,
    usersQueryRepository,
    securityDevicesQueryRepository,
  }: CookieRefreshTokenMiddlewareDeps) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req?.cookies?.refreshToken;

      if (!refreshToken) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        return;
      }

      const { deviceId, userId } =
        (await jwtService.getDeviceAndUserIdsByRefreshToken(refreshToken)) ||
        {};

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
