import { inject, injectable } from 'inversify';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import type { Result } from '@/core/result/result.type';

import { DeleteSecurityDeviceCommand } from '@/modules/security-devices';

import { LogoutUserCommand } from '../commands/logout-user.command';

@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
  ) {}

  async execute(command: LogoutUserCommand): Promise<Result<null>> {
    return await this.commandBus.execute<Result<null>>(
      new DeleteSecurityDeviceCommand({
        deviceId: command.deviceId,
        userId: command.userId,
      }),
    );
  }
}
