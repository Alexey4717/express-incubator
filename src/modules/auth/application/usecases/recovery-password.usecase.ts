import { add } from 'date-fns';
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

import { RecoveryPasswordCommand } from '../commands/recovery-password.command';
import { PasswordRecoveryRequestedEvent } from '../events/password-recovery-requested.event';

@injectable()
export class RecoveryPasswordUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
    @inject(CQRS_TYPES.EventBus)
    protected eventBus: EventBus,
  ) {}

  async execute(command: RecoveryPasswordCommand): Promise<null> {
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail(
      command.email,
    );
    if (!foundUser) {
      return null;
    }

    const user = UserEntity.reconstitute(foundUser);
    const recoveryCode = uuidv4();
    user.setRecoveryData({
      recoveryCode,
      expirationDate: add(new Date(), { days: 1 }),
    });

    const saved = await this.usersRepository.save(user);
    if (!saved) {
      throw domainException(DomainExceptionCode.BadRequest, 'UpdateFailed');
    }

    const sent = await this.eventBus.publish(
      new PasswordRecoveryRequestedEvent(command.email, recoveryCode),
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
