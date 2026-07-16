import { NextFunction, Request, Response } from 'express';

import { jwtService, usersQueryRepository } from '../../app/composition-root';
import { TokenTypes } from '../types/common';

export const setUserDataMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
