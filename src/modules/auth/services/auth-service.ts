import { add } from 'date-fns';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import { BcryptService } from '@/core/application/bcrypt-service';
import { CheckCredentialsInputArgs } from '@/core/types/common';

import type {
  CreateUserInputModel,
  CreateUserInsertToDBModel,
  TUserDb,
} from '@/modules/users';

import { UsersRepository } from '../../users/repositories/CUD/users-repository';
import { UsersQueryRepository } from '../../users/repositories/Queries/users-query-repository';
import { EmailManager } from '../managers/email-manager';
import type { CreateUserInputType } from './types';
import { ChangeUserPasswordInputType } from './types';

@injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected emailManager: EmailManager,
    protected bcryptService: BcryptService,
  ) {}

  async createUser({
    login,
    email,
    password,
  }: CreateUserInputModel): Promise<string | null> {
    const newUser = await this._getNewUser({
      login,
      email,
      password,
      isConfirmed: true,
    });
    const userId = await this.usersRepository.createUser(newUser);
    return userId?.toString() ?? null;
  }

  async createUserAndSendConfirmationMessage({
    login,
    email,
    password,
  }: CreateUserInputModel): Promise<boolean> {
    const newUser = await this._getNewUser({
      login,
      email,
      password,
      isConfirmed: false,
    });
    const userId = await this.usersRepository.createUser(newUser);
    if (!userId) return false;

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
      return false;
    }
    return true;
  }

  async resendConfirmationMessage(email: string): Promise<boolean> {
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail(email);
    if (!foundUser) return false;
    const confirmationCode = uuidv4();
    return await this.emailManager.sendEmailConfirmationMessage({
      user: foundUser,
      confirmationCode,
    });
  }

  async recoveryPassword(email: string): Promise<boolean> {
    return await this.emailManager.sendPasswordRecoveryMessage(email);
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.usersQueryRepository.findByConfirmationCode(code);
    if (
      !user ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.confirmationCode !== code ||
      user.emailConfirmation.expirationDate <= new Date()
    )
      return false;
    return await this.usersRepository.updateConfirmation(user._id);
  }

  async changeUserPassword({
    recoveryCode,
    newPassword,
  }: ChangeUserPasswordInputType): Promise<boolean> {
    const user =
      await this.usersQueryRepository.findUserByRecoveryCode(recoveryCode);
    if (
      !user ||
      !user?.recoveryData ||
      user.recoveryData?.recoveryCode !== recoveryCode ||
      user.recoveryData?.expirationDate <= new Date()
    )
      return false;
    const passwordHash = await this.bcryptService.generateHash(newPassword);
    return await this.usersRepository.changeUserPasswordAndNullifyRecoveryData({
      userId: user._id,
      passwordHash,
    });
  }

  async deleteUserById(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(id);
  }

  async checkCredentials({
    loginOrEmail,
    password,
  }: CheckCredentialsInputArgs): Promise<TUserDb | null> {
    const foundUser =
      await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!foundUser || !foundUser?.accountData?.passwordHash) return null;
    if (!foundUser.emailConfirmation.isConfirmed) return null;
    const passwordIsValid = await this.bcryptService.compare(
      password,
      foundUser.accountData.passwordHash,
    );
    if (!passwordIsValid) return null;
    return foundUser;
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
