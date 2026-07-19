import { inject, injectable } from 'inversify';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { EventBus } from '@/core/cqrs/buses/event-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { fail, isFailure, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import {
  CreateUserCommand,
  DeleteUserCommand,
  type IUsersQueryRepository,
  USERS_TYPES,
} from '@/modules/users';

import { RegisterUserCommand } from '../commands/register-user.command';
import { RegistrationConfirmationEmailEvent } from '../events/registration-confirmation-email.event';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
    @inject(CQRS_TYPES.EventBus)
    protected eventBus: EventBus,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<Result<null>> {
    const { login, email, password } = command.input;
    const createResult = await this.commandBus.execute<Result<string>>(
      new CreateUserCommand({ login, email, password, isConfirmed: false }),
    );

    if (isFailure(createResult)) {
      return fail(
        createResult.status,
        createResult.extensions,
        createResult.errorMessage,
      );
    }

    const userId = createResult.data!;
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail(email);
    if (!foundUser) {
      await this.commandBus.execute(new DeleteUserCommand(userId));
      return fail(ResultStatus.BadRequest, { reason: 'CreateUserFailed' });
    }

    const sent = await this.eventBus.publish(
      new RegistrationConfirmationEmailEvent(
        foundUser.accountData.email,
        foundUser.emailConfirmation.confirmationCode,
      ),
    );
    if (!sent) {
      await this.commandBus.execute(new DeleteUserCommand(userId));
      return fail(ResultStatus.BadRequest, { reason: 'EmailSendFailed' });
    }

    return ok(null);
  }
}
