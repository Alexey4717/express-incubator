import { NextFunction, Request, Response } from 'express';

import { constants } from 'http2';

export type AdminBasicAuthMiddlewareDeps = {
  adminUsername: string;
  adminPassword: string;
};

export const createAdminBasicAuthMiddleware =
  ({ adminUsername, adminPassword }: AdminBasicAuthMiddlewareDeps) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req?.headers?.authorization;
      if (!token) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        return;
      }

      const splitToken = token.split(' ');
      const authType = splitToken[0];
      const authData = Buffer.from(splitToken[1], 'base64')
        .toString('utf-8')
        .split(':');
      const login = authData[0];
      const password = authData[1];

      if (
        authType !== 'Basic' ||
        login !== adminUsername ||
        password !== adminPassword
      ) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        return;
      }

      next();
    } catch (error) {
      console.log(`Authorization middleware error is occurred: ${error}`);
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    }
  };
