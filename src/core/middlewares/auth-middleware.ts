import { NextFunction, Request, Response } from 'express';

import { constants } from 'http2';
import { ObjectId } from 'mongodb';

import { JwtService } from '../application/jwt-service';
import { RequestContextType, TokenTypes } from '../types/common';

export type AuthMiddlewareDeps = {
  jwtService: JwtService;
  usersQueryRepository: {
    findUserById: (userId: ObjectId) => Promise<RequestContextType['user']>;
  };
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

      req.context.user = foundUser;
      next();
    } catch (error) {
      console.log(`Auth middleware error is occurred: ${error}`);
    }
  };
