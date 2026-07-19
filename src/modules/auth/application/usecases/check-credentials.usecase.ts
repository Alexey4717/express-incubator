import { inject, injectable } from 'inversify';

import { BcryptService } from '@/core/application/bcrypt-service';
import {
  DomainException,
  domainException,
} from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import {
  type IUsersQueryRepository,
  type TUserDb,
  UserEntity,
  USERS_TYPES,
} from '@/modules/users';

import { CheckCredentialsCommand } from '../commands/check-credentials.command';

@injectable()
export class CheckCredentialsUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
    protected bcryptService: BcryptService,
  ) {}

  async execute(command: CheckCredentialsCommand): Promise<TUserDb> {
    const { loginOrEmail, password } = command.input;
    const foundUser =
      await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!foundUser || !foundUser.accountData?.passwordHash) {
      throw domainException(DomainExceptionCode.Unauthorized, 'UserNotFound');
    }

    const user = UserEntity.reconstitute(foundUser);
    if (!user.isEmailConfirmed()) {
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'EmailNotConfirmed',
        extensions: [{ key: 'reason', message: 'EmailNotConfirmed' }],
      });
    }

    const passwordIsValid = await this.bcryptService.compare(
      password,
      foundUser.accountData.passwordHash,
    );
    if (!passwordIsValid) {
      throw domainException(DomainExceptionCode.Unauthorized, 'WrongPassword');
    }
    return foundUser;
  }
}
