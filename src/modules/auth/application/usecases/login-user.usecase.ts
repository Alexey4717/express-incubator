import { inject, injectable } from 'inversify';

import { JwtService } from '@/core/application/jwt-service';
import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { fail, isFailure, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import { CreateSecurityDeviceCommand } from '@/modules/security-devices';
import type { TUserDb } from '@/modules/users';

import { CheckCredentialsCommand } from '../commands/check-credentials.command';
import { LoginUserCommand } from '../commands/login-user.command';

export type LoginUserResult = {
  accessToken: string;
  refreshToken: string;
};

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
    protected jwtService: JwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<Result<LoginUserResult>> {
    const credentialsResult = await this.commandBus.execute<Result<TUserDb>>(
      new CheckCredentialsCommand({
        loginOrEmail: command.input.loginOrEmail,
        password: command.input.password,
      }),
    );

    if (isFailure(credentialsResult)) {
      if (credentialsResult.status !== ResultStatus.Unauthorized) {
        return fail(
          ResultStatus.Unauthorized,
          credentialsResult.extensions,
          credentialsResult.errorMessage,
        );
      }
      return credentialsResult as Result<LoginUserResult>;
    }

    const user = credentialsResult.data!;
    const accessToken = await this.jwtService.createAccessJWT(user);
    const refreshTokenResult = await this.commandBus.execute<Result<string>>(
      new CreateSecurityDeviceCommand({
        user,
        title: command.input.userAgent,
        ip: command.input.ip,
      }),
    );

    if (isFailure(refreshTokenResult)) {
      return refreshTokenResult as Result<LoginUserResult>;
    }

    return ok({
      accessToken,
      refreshToken: refreshTokenResult.data!,
    });
  }
}
