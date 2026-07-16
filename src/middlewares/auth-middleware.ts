import {Request, Response, NextFunction} from "express";
import {constants} from 'http2';

import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/Queries-repo/users-query-repository";
import {TokenTypes} from "../types/common";


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authData = req?.headers?.authorization;
        if (!authData) {
            res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED)
            return;
        }

        const splitAuthData = authData.split(' ');
        const authType = splitAuthData[0];
        const token = splitAuthData[1];

        const userId = await jwtService.getUserIdByToken({token, type: TokenTypes.access});

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
