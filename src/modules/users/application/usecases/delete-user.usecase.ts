import { inject, injectable } from 'inversify';

import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import type { IUsersRepository } from '../../repositories/contracts/IUsersRepository';
import { USERS_TYPES } from '../../users.tokens';
import { DeleteUserCommand } from '../commands/delete-user.command';

@injectable()
export class DeleteUserUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<Result<null>> {
    const deleted = await this.usersRepository.deleteUserById(command.id);
    if (!deleted) {
      return fail(ResultStatus.NotFound, { reason: 'UserNotFound' });
    }
    return ok(null);
  }
}
