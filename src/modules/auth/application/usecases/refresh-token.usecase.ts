import { inject, injectable } from 'inversify';

import { JwtService } from '@/core/application/jwt-service';
import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';

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

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const newAccessToken = await this.jwtService.createAccessJWT(command.user);

    const newRefreshToken = await this.commandBus.execute<string>(
      new UpdateSecurityDeviceCommand({
        userId: command.user._id,
        deviceId: command.deviceId,
        oldRefreshTokenJti: command.oldRefreshTokenJti,
        title: command.userAgent,
        ip: command.ip,
      }),
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
