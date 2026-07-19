import { inject, injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

import { EventBus } from '@/core/cqrs/buses/event-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { mapDomainError } from '@/core/domain/map-domain-error';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

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

  async execute(command: ResendConfirmationCommand): Promise<Result<null>> {
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail(
      command.email,
    );
    if (!foundUser) {
      return fail(ResultStatus.BadRequest, { reason: 'UserNotFound' });
    }

    const user = UserEntity.reconstitute(foundUser);
    try {
      user.assertNotConfirmed();
    } catch (error) {
      return mapDomainError(error);
    }

    const confirmationCode = uuidv4();
    user.updateConfirmationCode(confirmationCode);
    const saved = await this.usersRepository.save(user);
    if (!saved) {
      return fail(ResultStatus.BadRequest, { reason: 'UpdateFailed' });
    }

    const sent = await this.eventBus.publish(
      new RegistrationConfirmationEmailEvent(
        foundUser.accountData.email,
        confirmationCode,
      ),
    );
    if (!sent) {
      return fail(ResultStatus.BadRequest, { reason: 'EmailSendFailed' });
    }

    return ok(null);
  }
}
