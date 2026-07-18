import { NextFunction, Request, Response } from 'express';

import { ObjectId } from 'mongodb';

import { JwtService } from '../application/jwt-service';
import { TokenTypes } from '../types/common';
import { RequestContextType } from '../types/request-context';

export type SetUserDataMiddlewareDeps = {
  jwtService: JwtService;
  usersQueryRepository: {
    findUserById: (userId: ObjectId) => Promise<RequestContextType['user']>;
  };
};

export const createSetUserDataMiddleware =
  ({ jwtService, usersQueryRepository }: SetUserDataMiddlewareDeps) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authData = req?.headers?.authorization;
      const splitAuthData = authData?.split(' ');
      const token = splitAuthData?.[1];
      let userId;

      if (token) {
        userId = await jwtService.getUserIdByToken({
          token,
          type: TokenTypes.access,
        });
      }

      if (userId) {
        const foundUser = await usersQueryRepository.findUserById(userId);
        req.context.user = foundUser;
      }

      next();
    } catch (error) {
      console.log(`Set user data middleware error is occurred: ${error}`);
    }
  };
