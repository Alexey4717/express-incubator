import {Request, Response} from "express";
import {constants} from "http2";
import {ObjectId} from 'mongodb';

import {RequestWithBody, TokenTypes} from "../types/common";
import {SigninInputModel} from "../models/AuthModels/SigninInputModel";
import {authService} from "../domain/auth-service";
import {jwtService} from "../application/jwt-service";
import {GetUserOutputModelFromMongoDB} from "../models/UserModels/GetUserOutputModel";
import {SignupInputModel} from "../models/AuthModels/SignupInputModel";
import {RegistrationConfirmInputModel} from "../models/AuthModels/RegistrationConfirmInputModel";
import {ResendRegistrationInputModel} from "../models/AuthModels/ResendRegistrationInputModel";
import {getMappedMeViewModel} from "../helpers";
import {securityDevicesService} from "../domain/security-devices-service";
import {NewPasswordInputModel} from "../models/AuthModels/NewPasswordInputModel";
import {RecoveryPasswordInputModel} from "../models/AuthModels/RcoveryPasswordInputModel";


export const authControllers = {
    async login(
        req: RequestWithBody<SigninInputModel>,
        res: Response
    ) {
        const {
            loginOrEmail,
            password
        } = req.body || {};
        const user = await authService.checkCredentials({loginOrEmail, password});
        // можно было бы сделать проверку user.accountData.isConfirmed, если false не пускать
        if (!user) {
            res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
            return;
        }

        const accessToken = await jwtService.createAccessJWT(user);
        const refreshToken = await securityDevicesService.createSecurityDevice({
            user,
            title: req.headers["user-agent"] || 'Unknown',
            ip: req.ip // на проде делать нужно по-другому (тут trust proxy - не очень практика, т.к. можно вручную изменить в headers)
            // ip:  req.headers["x-forwarded-for"] || req.socket.remoteAddress
        });

        res
            .status(constants.HTTP_STATUS_OK)
            .cookie("refreshToken", refreshToken, {httpOnly: true, secure: true})
            .json({accessToken});
    },

    async refreshToken(
        req: Request,
        res: Response
    ) {
        const user = req.context?.user;
        const deviceId = req.context?.securityDevice?._id;

        if (!user || !deviceId) {
            res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
            return;
        }

        const newAccessToken = await jwtService.createAccessJWT(user);
        const newRefreshToken = await securityDevicesService.updateSecurityDeviceById({
            userId: new ObjectId(user._id),
            deviceId: new ObjectId(deviceId),
            title: req.headers["user-agent"] || 'Unknown',
            ip: req.ip
        });

        if (!newRefreshToken) {
            res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
            return;
        }

        res
            .status(constants.HTTP_STATUS_OK)
            .cookie("refreshToken", newRefreshToken, {httpOnly: true, secure: true})
            .json({accessToken: newAccessToken});
    },

    async registration(
        req: RequestWithBody<SignupInputModel>,
        res: Response
    ) {
        const {
            login,
            password,
            email
        } = req.body || {};

        const result = await authService.createUserAndSendConfirmationMessage({
            email,
            login,
            password
        });

        if (!result) {
            // maybe need send other status code
            res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
            return;
        }
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },

    async registrationConfirmation(
        req: RequestWithBody<RegistrationConfirmInputModel>,
        res: Response
    ) {
        const {code} = req.body || {};
        const result = await authService.confirmEmail(code);
        if (!result) {
            // maybe need send other status code
            res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
            return;
        }
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },

    async newPassword(
        req: RequestWithBody<NewPasswordInputModel>,
        res: Response
    ) {
        const {newPassword, recoveryCode} = req.body || {};
        const result = await authService.changeUserPassword({recoveryCode, newPassword});
        if (!result) {
            // maybe need send other status code
            res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
            return;
        }
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },

    async recoveryPassword(
        req: RequestWithBody<RecoveryPasswordInputModel>,
        res: Response
    ) {
        const {email} = req.body || {};
        const result = await authService.recoveryPassword(email);

        if (!result) {
            res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
            return;
        }

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },

    async registrationEmailResending(
        req: RequestWithBody<ResendRegistrationInputModel>,
        res: Response
    ) {
        const {email} = req.body || {};
        const result = await authService.resendConfirmationMessage(email);

        if (!result) {
            res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
            return;
        }

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },

    async logout(
        req: Request,
        res: Response
    ) {
        const deviceId = req.context?.securityDevice!._id;
        const deleteResult = await securityDevicesService.deleteSecurityDeviceById(deviceId);

        if (!deleteResult) {
            res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
            return;
        }

        return res
            .clearCookie("refreshToken")
            .sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },

    async getMe(
        req: Request,
        res: Response
    ) {
        if (!req.context.user) {
            res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED)
            return
        }
        res.status(constants.HTTP_STATUS_OK).json(getMappedMeViewModel(req.context.user))
    },
};
