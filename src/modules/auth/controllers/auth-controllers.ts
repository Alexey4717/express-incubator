import { Request, Response } from 'express';

import { constants } from 'http2';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { JwtService } from '@/core/application/jwt-service';
import { isFailure, sendFailure } from '@/core/result/handle-result';
import { RequestWithBody } from '@/core/types/common';

import { SecurityDevicesService } from '../../security-devices/services/security-devices-service';
import { getMappedMeViewModel } from '../helpers/map-to-me-output';
import { NewPasswordInputModel } from '../models/NewPasswordInputModel';
import { RecoveryPasswordInputModel } from '../models/RecoveryPasswordInputModel';
import { RegistrationConfirmInputModel } from '../models/RegistrationConfirmInputModel';
import { ResendRegistrationInputModel } from '../models/ResendRegistrationInputModel';
import { SigninInputModel } from '../models/SigninInputModel';
import { SignupInputModel } from '../models/SignupInputModel';
import { AuthService } from '../services/auth-service';

@injectable()
export class AuthControllers {
  constructor(
    protected authService: AuthService,
    protected jwtService: JwtService,
    protected securityDevicesService: SecurityDevicesService,
  ) {}

  async login(req: RequestWithBody<SigninInputModel>, res: Response) {
    const { loginOrEmail, password } = req.body || {};
    const result = await this.authService.loginUser({
      loginOrEmail,
      password,
    });
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const user = result.data!;
    const accessToken = await this.jwtService.createAccessJWT(user);
    const refreshTokenResult =
      await this.securityDevicesService.createSecurityDevice({
        user,
        title: req.headers['user-agent'] || 'Unknown',
        ip: req.ip ?? 'Unknown',
      });

    if (isFailure(refreshTokenResult)) {
      sendFailure(res, refreshTokenResult);
      return;
    }

    res
      .status(constants.HTTP_STATUS_OK)
      .cookie('refreshToken', refreshTokenResult.data, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken });
  }

  async refreshToken(req: Request, res: Response) {
    const user = req.context?.user;
    const deviceId = req.context?.securityDevice?._id;

    if (!user || !deviceId) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const newAccessToken = await this.jwtService.createAccessJWT(user);
    const oldRefreshTokenJti = req.context?.refreshTokenJti;

    if (!oldRefreshTokenJti) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const refreshTokenResult =
      await this.securityDevicesService.updateSecurityDeviceById({
        userId: new ObjectId(user._id),
        deviceId: new ObjectId(deviceId),
        oldRefreshTokenJti,
        title: req.headers['user-agent'] || 'Unknown',
        ip: req.ip ?? 'Unknown',
      });

    if (isFailure(refreshTokenResult)) {
      sendFailure(res, refreshTokenResult);
      return;
    }

    res
      .status(constants.HTTP_STATUS_OK)
      .cookie('refreshToken', refreshTokenResult.data, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: newAccessToken });
  }

  async registration(req: RequestWithBody<SignupInputModel>, res: Response) {
    const { login, password, email } = req.body || {};

    const result = await this.authService.createUserAndSendConfirmationMessage({
      email,
      login,
      password,
    });

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async registrationConfirmation(
    req: RequestWithBody<RegistrationConfirmInputModel>,
    res: Response,
  ) {
    const { code } = req.body || {};
    const result = await this.authService.confirmEmail(code);
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async newPassword(
    req: RequestWithBody<NewPasswordInputModel>,
    res: Response,
  ) {
    const { newPassword, recoveryCode } = req.body || {};
    const result = await this.authService.changeUserPassword({
      recoveryCode,
      newPassword,
    });
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async recoveryPassword(
    req: RequestWithBody<RecoveryPasswordInputModel>,
    res: Response,
  ) {
    const { email } = req.body || {};
    const result = await this.authService.recoveryPassword(email);

    if (isFailure(result)) {
      if (result.extensions?.reason === 'EmailSendFailed') {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
        return;
      }
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async registrationEmailResending(
    req: RequestWithBody<ResendRegistrationInputModel>,
    res: Response,
  ) {
    const { email } = req.body || {};
    const result = await this.authService.resendConfirmationMessage(email);

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async logout(req: Request, res: Response) {
    const deviceId = req.context?.securityDevice!._id;
    const deleteResult =
      await this.securityDevicesService.deleteSecurityDeviceById(
        new ObjectId(deviceId),
        new ObjectId(req.context!.user!._id),
      );

    if (isFailure(deleteResult)) {
      if (deleteResult.extensions?.reason === 'DeleteDeviceFailed') {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
        return;
      }
      sendFailure(res, deleteResult);
      return;
    }

    return res
      .clearCookie('refreshToken')
      .sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async getMe(req: Request, res: Response) {
    if (!req.context.user) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }
    res
      .status(constants.HTTP_STATUS_OK)
      .json(getMappedMeViewModel(req.context.user));
  }
}
