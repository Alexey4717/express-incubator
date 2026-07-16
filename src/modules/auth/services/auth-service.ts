import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import { EmailManager } from '../../../core/managers/email-manager';
import { CheckCredentialsInputArgs } from '../../../core/types/common';
import { CreateUserInputModel } from '../../users/models/UserModels/CreateUserInputModel';
import { CreateUserInsertToDBModel } from '../../users/models/UserModels/CreateUserInsertToDBModel';
import { GetUserOutputModelFromMongoDB } from '../../users/models/UserModels/GetUserOutputModel';
import { UsersRepository } from '../../users/repositories/CUD/users-repository';
import type { CreateUserInputType } from './types';
import { ChangeUserPasswordInputType } from './types';

@injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailManager,
  ) {}

  async createUser({
    login,
    email,
    password,
  }: CreateUserInputModel): Promise<GetUserOutputModelFromMongoDB> {
    const newUser = await this._getNewUser({
      login,
      email,
      password,
      isConfirmed: true,
    });
    return await this.usersRepository.createUser(newUser);
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
    const createdUser = await this.usersRepository.createUser(newUser);
    try {
      await this.emailManager.sendEmailConfirmationMessage({
        user: createdUser,
      });
    } catch (error) {
      console.error(`AuthService.registerUser error is occurred: ${error}`);
      await this.usersRepository.deleteUserById(createdUser._id.toString());
      return false;
    }
    return Boolean(createdUser);
  }

  async resendConfirmationMessage(email: string): Promise<boolean> {
    const foundUser = await this.usersRepository.findByLoginOrEmail(email);
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
    const user = await this.usersRepository.findByConfirmationCode(code);
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
      await this.usersRepository.findUserByRecoveryCode(recoveryCode);
    if (
      !user ||
      !user?.recoveryData ||
      user.recoveryData?.recoveryCode !== recoveryCode ||
      user.recoveryData?.expirationDate <= new Date()
    )
      return false;
    const passwordHash = await this._generateHash(newPassword);
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
  }: CheckCredentialsInputArgs): Promise<GetUserOutputModelFromMongoDB | null> {
    const foundUser =
      await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!foundUser || !foundUser?.accountData?.passwordHash) return null;
    const passwordIsValid = await bcrypt.compare(
      password,
      foundUser.accountData.passwordHash,
    );
    if (!passwordIsValid) return null;
    return foundUser;
  }

  async _generateHash(password: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }

  async _getNewUser({
    login,
    email,
    password,
    isConfirmed,
  }: CreateUserInputType): Promise<CreateUserInsertToDBModel> {
    const passwordHash = await this._generateHash(password);
    return {
      _id: new ObjectId(),
      accountData: {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(), // generate unique id
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed,
      },
      recoveryData: null,
    };
  }
}
