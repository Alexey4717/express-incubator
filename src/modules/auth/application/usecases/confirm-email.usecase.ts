import { inject, injectable } from 'inversify';

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

import { ConfirmEmailCommand } from '../commands/confirm-email.command';

@injectable()
export class ConfirmEmailUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<Result<null>> {
    const foundUser = await this.usersQueryRepository.findByConfirmationCode(
      command.code,
    );
    if (!foundUser) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeNotFound' });
    }

    const user = UserEntity.reconstitute(foundUser);
    try {
      user.confirmEmail(command.code);
    } catch (error) {
      return mapDomainError(error);
    }

    const updated = await this.usersRepository.save(user);
    if (!updated) {
      return fail(ResultStatus.BadRequest, { reason: 'UpdateFailed' });
    }
    return ok(null);
  }
}
