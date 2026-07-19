import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

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

  async execute(command: ConfirmEmailCommand): Promise<null> {
    const foundUser = await this.usersQueryRepository.findByConfirmationCode(
      command.code,
    );
    if (!foundUser) {
      throw domainException(DomainExceptionCode.BadRequest, 'CodeNotFound');
    }

    const user = UserEntity.reconstitute(foundUser);
    user.confirmEmail(command.code);

    const updated = await this.usersRepository.save(user);
    if (!updated) {
      throw domainException(DomainExceptionCode.BadRequest, 'UpdateFailed');
    }
    return null;
  }
}
