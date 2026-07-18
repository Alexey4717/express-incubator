import { add } from 'date-fns';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import { BcryptService } from '@/core/application/bcrypt-service';
import { fail, isFailure, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';
import { CheckCredentialsInputArgs } from '@/core/types/common';

import type {
  CreateUserInputModel,
  CreateUserInsertToDBModel,
  TUserDb,
} from '@/modules/users';

import type { IUsersQueryRepository } from '../../users/repositories/contracts/IUsersQueryRepository';
import type { IUsersRepository } from '../../users/repositories/contracts/IUsersRepository';
import { USERS_TYPES } from '../../users/users.tokens';
import { EmailManager } from '../managers/email-manager';
import type { CreateUserInputType } from './types';
import { ChangeUserPasswordInputType } from './types';

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
    const newUser = await this._getNewUser({
      login,
      email,
      password,
      isConfirmed: true,
    });
    const userId = await this.usersRepository.createUser(newUser);
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
    const newUser = await this._getNewUser({
      login,
      email,
      password,
      isConfirmed: false,
    });
    const userId = await this.usersRepository.createUser(newUser);
    if (!userId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateUserFailed' });
    }

    const createdUser: TUserDb = {
      ...newUser,
      _id: userId,
    };

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
    if (foundUser.emailConfirmation.isConfirmed) {
      return fail(ResultStatus.BadRequest, { reason: 'AlreadyConfirmed' });
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
    const user = await this.usersQueryRepository.findByConfirmationCode(code);
    if (!user) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeNotFound' });
    }
    if (user.emailConfirmation.isConfirmed) {
      return fail(ResultStatus.BadRequest, { reason: 'AlreadyConfirmed' });
    }
    if (user.emailConfirmation.confirmationCode !== code) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeMismatch' });
    }
    if (user.emailConfirmation.expirationDate <= new Date()) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeExpired' });
    }

    const updated = await this.usersRepository.updateConfirmation(user._id);
    if (!updated) {
      return fail(ResultStatus.BadRequest, { reason: 'UpdateFailed' });
    }
    return ok(null);
  }

  async changeUserPassword({
    recoveryCode,
    newPassword,
  }: ChangeUserPasswordInputType): Promise<Result<null>> {
    const user =
      await this.usersQueryRepository.findUserByRecoveryCode(recoveryCode);
    if (!user || !user.recoveryData) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeNotFound' });
    }
    if (user.recoveryData.recoveryCode !== recoveryCode) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeMismatch' });
    }
    if (user.recoveryData.expirationDate <= new Date()) {
      return fail(ResultStatus.BadRequest, { reason: 'CodeExpired' });
    }

    const passwordHash = await this.bcryptService.generateHash(newPassword);
    const updated =
      await this.usersRepository.changeUserPasswordAndNullifyRecoveryData({
        userId: user._id,
        passwordHash,
      });
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
    if (!foundUser.emailConfirmation.isConfirmed) {
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

  async _getNewUser({
    login,
    email,
    password,
    isConfirmed,
  }: CreateUserInputType): Promise<CreateUserInsertToDBModel> {
    const passwordHash = await this.bcryptService.generateHash(password);
    return {
      _id: new ObjectId(),
      accountData: {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed,
      },
      recoveryData: null,
    };
  }
}
