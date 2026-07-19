import { inject, injectable } from 'inversify';

import { BcryptService } from '@/core/application/bcrypt-service';
import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

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

  async execute(command: ChangePasswordCommand): Promise<null> {
    const foundUser = await this.usersQueryRepository.findUserByRecoveryCode(
      command.recoveryCode,
    );
    if (!foundUser) {
      throw domainException(DomainExceptionCode.BadRequest, 'CodeNotFound');
    }

    const user = UserEntity.reconstitute(foundUser);
    user.validateRecoveryCode(command.recoveryCode);

    const passwordHash = await this.bcryptService.generateHash(
      command.newPassword,
    );
    user.changePassword(passwordHash);
    const updated = await this.usersRepository.save(user);
    if (!updated) {
      throw domainException(DomainExceptionCode.BadRequest, 'UpdateFailed');
    }
    return null;
  }
}
