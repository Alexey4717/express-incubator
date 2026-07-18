import { NextFunction, Request, Response } from 'express';

import { constants } from 'http2';

import { JwtService } from '../application/jwt-service';
import type { IUserQueryPort } from '../ports/query-ports';
import { TokenTypes } from '../types/common';

export type AuthMiddlewareDeps = {
  jwtService: JwtService;
  usersQueryRepository: IUserQueryPort;
};

export const createAuthMiddleware =
  ({ jwtService, usersQueryRepository }: AuthMiddlewareDeps) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authData = req?.headers?.authorization;
      if (!authData) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        return;
      }

      const splitAuthData = authData.split(' ');
      const authType = splitAuthData[0];
      const token = splitAuthData[1];

      const userId = await jwtService.getUserIdByToken({
        token,
        type: TokenTypes.access,
      });

      if (authType !== 'Bearer' || !userId) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        return;
      }

      const foundUser = await usersQueryRepository.findUserById(userId);

      if (!foundUser) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        return;
      }

      req.context.user = foundUser;
      next();
    } catch (error) {
      console.log(`Auth middleware error is occurred: ${error}`);
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    }
  };
