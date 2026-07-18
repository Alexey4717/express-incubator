import { add } from 'date-fns';
import { inject, injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import {
  type IUsersQueryRepository,
  type IUsersRepository,
  UserEntity,
  USERS_TYPES,
} from '@/modules/users';

import { RecoveryPasswordCommand } from '../commands/recovery-password.command';
import { EmailNotificationService } from '../services/email-notification.service';

@injectable()
export class RecoveryPasswordUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
    protected emailNotificationService: EmailNotificationService,
  ) {}

  async execute(command: RecoveryPasswordCommand): Promise<Result<null>> {
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail(
      command.email,
    );
    if (!foundUser) {
      return ok(null);
    }

    const user = UserEntity.reconstitute(foundUser);
    const recoveryCode = uuidv4();
    user.setRecoveryData({
      recoveryCode,
      expirationDate: add(new Date(), { days: 1 }),
    });

    const saved = await this.usersRepository.save(user);
    if (!saved) {
      return fail(ResultStatus.BadRequest, { reason: 'UpdateFailed' });
    }

    const sent = await this.emailNotificationService.sendPasswordRecovery({
      email: command.email,
      recoveryCode,
    });
    if (!sent) {
      return fail(ResultStatus.BadRequest, { reason: 'EmailSendFailed' });
    }

    return ok(null);
  }
}
