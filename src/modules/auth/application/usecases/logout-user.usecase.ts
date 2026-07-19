import { inject, injectable } from 'inversify';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';

import { DeleteSecurityDeviceCommand } from '@/modules/security-devices';

import { LogoutUserCommand } from '../commands/logout-user.command';

@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
  ) {}

  async execute(command: LogoutUserCommand): Promise<null> {
    await this.commandBus.execute(
      new DeleteSecurityDeviceCommand({
        deviceId: command.deviceId,
        userId: command.userId,
      }),
    );
    return null;
  }
}
