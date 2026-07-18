import { inject, injectable } from 'inversify';

import { BcryptService } from '@/core/application/bcrypt-service';
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

import { ChangePasswordCommand } from '../commands/change-password.command';

@injectable()
export class ChangePasswordUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
    protected bcryptService: BcryptService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<Result<null>> {
    const foundUser = await this.usersQueryRepository.findUserByRecoveryCode(
      command.recoveryCode,
    );
    if (!foundUser) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeNotFound' });
    }

    const user = UserEntity.reconstitute(foundUser);
    try {
      user.validateRecoveryCode(command.recoveryCode);
    } catch (error) {
      return mapDomainError(error);
    }

    const passwordHash = await this.bcryptService.generateHash(
      command.newPassword,
    );
    user.changePassword(passwordHash);
    const updated = await this.usersRepository.save(user);
    if (!updated) {
      return fail(ResultStatus.BadRequest, { reason: 'UpdateFailed' });
    }
    return ok(null);
  }
}
