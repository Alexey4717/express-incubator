import { inject, injectable } from 'inversify';

import { BcryptService } from '@/core/application/bcrypt-service';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

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

  async execute(command: CheckCredentialsCommand): Promise<Result<TUserDb>> {
    const { loginOrEmail, password } = command.input;
    const foundUser =
      await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!foundUser || !foundUser.accountData?.passwordHash) {
      return fail(ResultStatus.NotFound, { reason: 'UserNotFound' });
    }

    const user = UserEntity.reconstitute(foundUser);
    if (!user.isEmailConfirmed()) {
      return fail(ResultStatus.BadRequest, { reason: 'EmailNotConfirmed' });
    }

    const passwordIsValid = await this.bcryptService.compare(
      password,
      foundUser.accountData.passwordHash,
    );
    if (!passwordIsValid) {
      return fail(ResultStatus.Unauthorized, { reason: 'WrongPassword' });
    }
    return ok(foundUser);
  }
}
