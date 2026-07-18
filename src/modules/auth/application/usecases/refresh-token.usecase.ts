import { inject, injectable } from 'inversify';

import { JwtService } from '@/core/application/jwt-service';
import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { isFailure, ok } from '@/core/result/handle-result';
import type { Result } from '@/core/result/result.type';

import { UpdateSecurityDeviceCommand } from '@/modules/security-devices';

import { RefreshTokenCommand } from '../commands/refresh-token.command';

export type RefreshTokenResult = {
  accessToken: string;
  refreshToken: string;
};

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
    protected jwtService: JwtService,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<Result<RefreshTokenResult>> {
    const newAccessToken = await this.jwtService.createAccessJWT(command.user);

    const refreshTokenResult = await this.commandBus.execute<Result<string>>(
      new UpdateSecurityDeviceCommand({
        userId: command.user._id,
        deviceId: command.deviceId,
        oldRefreshTokenJti: command.oldRefreshTokenJti,
        title: command.userAgent,
        ip: command.ip,
      }),
    );

    if (isFailure(refreshTokenResult)) {
      return refreshTokenResult as Result<RefreshTokenResult>;
    }

    return ok({
      accessToken: newAccessToken,
      refreshToken: refreshTokenResult.data!,
    });
  }
}
