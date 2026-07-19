import { inject, injectable } from 'inversify';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { EventBus } from '@/core/cqrs/buses/event-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

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

  async execute(command: RegisterUserCommand): Promise<null> {
    const { login, email, password } = command.input;
    const userId = await this.commandBus.execute<string>(
      new CreateUserCommand({ login, email, password, isConfirmed: false }),
    );

    const foundUser = await this.usersQueryRepository.findByLoginOrEmail(email);
    if (!foundUser) {
      await this.commandBus.execute(new DeleteUserCommand(userId));
      throw domainException(DomainExceptionCode.BadRequest, 'CreateUserFailed');
    }

    const sent = await this.eventBus.publish(
      new RegistrationConfirmationEmailEvent(
        foundUser.accountData.email,
        foundUser.emailConfirmation.confirmationCode,
      ),
    );
    if (!sent) {
      await this.commandBus.execute(new DeleteUserCommand(userId));
      throw domainException(
        DomainExceptionCode.InternalServerError,
        'EmailSendFailed',
      );
    }

    return null;
  }
}
