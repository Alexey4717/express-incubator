import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import type { IUsersRepository } from '../../repositories/contracts/IUsersRepository';
import { USERS_TYPES } from '../../users.tokens';
import { DeleteUserCommand } from '../commands/delete-user.command';

@injectable()
export class DeleteUserUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<null> {
    const deleted = await this.usersRepository.deleteUserById(command.id);
    if (!deleted) {
      throw domainException(DomainExceptionCode.NotFound, 'UserNotFound');
    }
    return null;
  }
}
