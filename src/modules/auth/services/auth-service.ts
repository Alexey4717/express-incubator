import { inject, injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

import { BcryptService } from '@/core/application/bcrypt-service';
import { mapDomainError } from '@/core/domain/map-domain-error';
import { fail, isFailure, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';
import { CheckCredentialsInputArgs } from '@/core/types/common';

import {
  type CreateUserInputModel,
  type TUserDb,
  UserEntity,
} from '@/modules/users';

import type { IUsersQueryRepository } from '../../users/repositories/contracts/IUsersQueryRepository';
import type { IUsersRepository } from '../../users/repositories/contracts/IUsersRepository';
import { USERS_TYPES } from '../../users/users.tokens';
import { EmailManager } from '../managers/email-manager';

@injectable()
export class AuthService {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
    protected emailManager: EmailManager,
    protected bcryptService: BcryptService,
  ) {}

  async createUser({
    login,
    email,
    password,
  }: CreateUserInputModel): Promise<Result<string>> {
    const passwordHash = await this.bcryptService.generateHash(password);
    const user = UserEntity.create({
      login,
      email,
      passwordHash,
      isConfirmed: true,
    });
    const userId = await this.usersRepository.createUser(user);
    if (!userId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateUserFailed' });
    }
    return ok(userId.toString());
  }

  async createUserAndSendConfirmationMessage({
    login,
    email,
    password,
  }: CreateUserInputModel): Promise<Result<null>> {
    const passwordHash = await this.bcryptService.generateHash(password);
    const user = UserEntity.create({
      login,
      email,
      passwordHash,
      isConfirmed: false,
    });
    const userId = await this.usersRepository.createUser(user);
    if (!userId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateUserFailed' });
    }

    const createdUser = user.toDb();

    try {
      await this.emailManager.sendEmailConfirmationMessage({
        user: createdUser,
      });
    } catch (error) {
      console.error(`AuthService.registerUser error is occurred: ${error}`);
      await this.usersRepository.deleteUserById(userId.toString());
      return fail(ResultStatus.BadRequest, { reason: 'EmailSendFailed' });
    }
    return ok(null);
  }

  async resendConfirmationMessage(email: string): Promise<Result<null>> {
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail(email);
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
    const sent = await this.emailManager.sendEmailConfirmationMessage({
      user: foundUser,
      confirmationCode,
    });
    if (!sent) {
      return fail(ResultStatus.BadRequest, { reason: 'EmailSendFailed' });
    }
    return ok(null);
  }

  async recoveryPassword(email: string): Promise<Result<null>> {
    const sent = await this.emailManager.sendPasswordRecoveryMessage(email);
    if (!sent) {
      return fail(ResultStatus.BadRequest, { reason: 'EmailSendFailed' });
    }
    return ok(null);
  }

  async confirmEmail(code: string): Promise<Result<null>> {
    const foundUser =
      await this.usersQueryRepository.findByConfirmationCode(code);
    if (!foundUser) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeNotFound' });
    }

    const user = UserEntity.reconstitute(foundUser);
    try {
      user.confirmEmail(code);
    } catch (error) {
      return mapDomainError(error);
    }

    const updated = await this.usersRepository.save(user);
    if (!updated) {
      return fail(ResultStatus.BadRequest, { reason: 'UpdateFailed' });
    }
    return ok(null);
  }

  async changeUserPassword({
    recoveryCode,
    newPassword,
  }: {
    recoveryCode: string;
    newPassword: string;
  }): Promise<Result<null>> {
    const foundUser =
      await this.usersQueryRepository.findUserByRecoveryCode(recoveryCode);
    if (!foundUser) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeNotFound' });
    }

    const user = UserEntity.reconstitute(foundUser);
    try {
      user.validateRecoveryCode(recoveryCode);
    } catch (error) {
      return mapDomainError(error);
    }

    const passwordHash = await this.bcryptService.generateHash(newPassword);
    user.changePassword(passwordHash);
    const updated = await this.usersRepository.save(user);
    if (!updated) {
      return fail(ResultStatus.BadRequest, { reason: 'UpdateFailed' });
    }
    return ok(null);
  }

  async deleteUserById(id: string): Promise<Result<null>> {
    const deleted = await this.usersRepository.deleteUserById(id);
    if (!deleted) {
      return fail(ResultStatus.NotFound, { reason: 'UserNotFound' });
    }
    return ok(null);
  }

  async checkCredentials({
    loginOrEmail,
    password,
  }: CheckCredentialsInputArgs): Promise<Result<TUserDb>> {
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

  async loginUser(args: CheckCredentialsInputArgs): Promise<Result<TUserDb>> {
    const result = await this.checkCredentials(args);
    if (isFailure(result) && result.status !== ResultStatus.Unauthorized) {
      return fail(
        ResultStatus.Unauthorized,
        result.extensions,
        result.errorMessage,
      );
    }
    return result;
  }
}
