import { inject, injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

import { EventBus } from '@/core/cqrs/buses/event-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import {
  type IUsersQueryRepository,
  type IUsersRepository,
  UserEntity,
  USERS_TYPES,
} from '@/modules/users';

import { ResendConfirmationCommand } from '../commands/resend-confirmation.command';
import { RegistrationConfirmationEmailEvent } from '../events/registration-confirmation-email.event';

@injectable()
export class ResendConfirmationUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
    @inject(CQRS_TYPES.EventBus)
    protected eventBus: EventBus,
  ) {}

  async execute(command: ResendConfirmationCommand): Promise<null> {
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail(
      command.email,
    );
    if (!foundUser) {
      throw domainException(DomainExceptionCode.BadRequest, 'UserNotFound');
    }

    const user = UserEntity.reconstitute(foundUser);
    user.assertNotConfirmed();

    const confirmationCode = uuidv4();
    user.updateConfirmationCode(confirmationCode);
    const saved = await this.usersRepository.save(user);
    if (!saved) {
      throw domainException(DomainExceptionCode.BadRequest, 'UpdateFailed');
    }

    const sent = await this.eventBus.publish(
      new RegistrationConfirmationEmailEvent(
        foundUser.accountData.email,
        confirmationCode,
      ),
    );
    if (!sent) {
      throw domainException(
        DomainExceptionCode.InternalServerError,
        'EmailSendFailed',
      );
    }

    return null;
  }
}
