import { Request, Response } from 'express';

import { constants } from 'http2';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { isFailure, sendFailure } from '@/core/result/handle-result';
import type { Result } from '@/core/result/result.type';
import { RequestWithBody } from '@/core/types/common';

import { ChangePasswordCommand } from '../application/commands/change-password.command';
import { ConfirmEmailCommand } from '../application/commands/confirm-email.command';
import { LoginUserCommand } from '../application/commands/login-user.command';
import { LogoutUserCommand } from '../application/commands/logout-user.command';
import { RecoveryPasswordCommand } from '../application/commands/recovery-password.command';
import { RefreshTokenCommand } from '../application/commands/refresh-token.command';
import { RegisterUserCommand } from '../application/commands/register-user.command';
import { ResendConfirmationCommand } from '../application/commands/resend-confirmation.command';
import type { LoginUserResult } from '../application/usecases/login-user.usecase';
import type { RefreshTokenResult } from '../application/usecases/refresh-token.usecase';
import { getMappedMeViewModel } from '../helpers/map-to-me-output';
import { NewPasswordInputModel } from '../models/NewPasswordInputModel';
import { RecoveryPasswordInputModel } from '../models/RecoveryPasswordInputModel';
import { RegistrationConfirmInputModel } from '../models/RegistrationConfirmInputModel';
import { ResendRegistrationInputModel } from '../models/ResendRegistrationInputModel';
import { SigninInputModel } from '../models/SigninInputModel';
import { SignupInputModel } from '../models/SignupInputModel';

@injectable()
export class AuthControllers {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
  ) {}

  async login(req: RequestWithBody<SigninInputModel>, res: Response) {
    const { loginOrEmail, password } = req.body || {};
    const result = await this.commandBus.execute<Result<LoginUserResult>>(
      new LoginUserCommand({
        loginOrEmail,
        password,
        userAgent: req.headers['user-agent'] || 'Unknown',
        ip: req.ip ?? 'Unknown',
      }),
    );
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const { accessToken, refreshToken } = result.data!;
    res
      .status(constants.HTTP_STATUS_OK)
      .cookie('refreshToken', refreshToken, {
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

    const oldRefreshTokenJti = req.context?.refreshTokenJti;
    if (!oldRefreshTokenJti) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const result = await this.commandBus.execute<Result<RefreshTokenResult>>(
      new RefreshTokenCommand(
        user,
        new ObjectId(deviceId),
        oldRefreshTokenJti,
        req.headers['user-agent'] || 'Unknown',
        req.ip ?? 'Unknown',
      ),
    );

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const { accessToken, refreshToken } = result.data!;
    res
      .status(constants.HTTP_STATUS_OK)
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken });
  }

  async registration(req: RequestWithBody<SignupInputModel>, res: Response) {
    const { login, password, email } = req.body || {};
    const result = await this.commandBus.execute<Result<null>>(
      new RegisterUserCommand({ email, login, password }),
    );

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
    const result = await this.commandBus.execute<Result<null>>(
      new ConfirmEmailCommand(code),
    );
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
    const result = await this.commandBus.execute<Result<null>>(
      new ChangePasswordCommand(recoveryCode, newPassword),
    );
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
    const result = await this.commandBus.execute<Result<null>>(
      new RecoveryPasswordCommand(email),
    );

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
    const result = await this.commandBus.execute<Result<null>>(
      new ResendConfirmationCommand(email),
    );

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async logout(req: Request, res: Response) {
    const deviceId = req.context?.securityDevice!._id;
    const deleteResult = await this.commandBus.execute<Result<null>>(
      new LogoutUserCommand(
        new ObjectId(deviceId),
        new ObjectId(req.context!.user!._id),
      ),
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
