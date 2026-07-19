import { inject, injectable } from 'inversify';

import { JwtService } from '@/core/application/jwt-service';
import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { DomainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

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

  async execute(command: LoginUserCommand): Promise<LoginUserResult> {
    let user: TUserDb;
    try {
      user = await this.commandBus.execute<TUserDb>(
        new CheckCredentialsCommand({
          loginOrEmail: command.input.loginOrEmail,
          password: command.input.password,
        }),
      );
    } catch (error) {
      if (
        error instanceof DomainException &&
        error.code !== DomainExceptionCode.Unauthorized
      ) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: error.message,
          extensions: error.extensions,
        });
      }
      throw error;
    }

    const accessToken = await this.jwtService.createAccessJWT(user);
    const refreshToken = await this.commandBus.execute<string>(
      new CreateSecurityDeviceCommand({
        user,
        title: command.input.userAgent,
        ip: command.input.ip,
      }),
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
