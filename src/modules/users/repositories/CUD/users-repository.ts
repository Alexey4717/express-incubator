import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CreateUserInsertToDBModel } from '../../models/CreateUserInsertToDBModel';
import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';
import UserModel from '../../models/User-model';
import {
  ChangeUserPasswordArgs,
  SetUserRecoveryDataInputType,
  UpdateUserConfirmationCodeInputType,
} from './types';

@injectable()
export class UsersRepository {
  async createUser(
    newUser: CreateUserInsertToDBModel,
  ): Promise<GetUserOutputModelFromMongoDB> {
    try {
      const result = await UserModel.create(newUser);
      if (!result._id) throw new Error('Insert user error');
      const createdUser = {
        ...newUser,
        _id: result._id,
      };
      return createdUser;
    } catch (error) {
      console.log(`UsersRepository.createUser error is occurred: ${error}`);
      return {} as GetUserOutputModelFromMongoDB;
    }
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return await UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    }).lean();
  }

  async deleteUserById(id: string): Promise<boolean> {
    try {
      const result = await UserModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`UsersRepository.deleteUserById error is occurred: ${error}`);
      return false;
    }
  }

  async updateConfirmation(userId: ObjectId): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.matchedCount === 1;
  }

  async changeUserPasswordAndNullifyRecoveryData({
    userId,
    passwordHash,
  }: ChangeUserPasswordArgs): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          'accountData.passwordHash': passwordHash,
          recoveryData: null,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async setUserRecoveryData({
    userId,
    recoveryData,
  }: SetUserRecoveryDataInputType): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { recoveryData } },
    );
    return result.matchedCount === 1;
  }

  async updateUserConfirmationCode({
    userId,
    newCode,
  }: UpdateUserConfirmationCodeInputType): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.confirmationCode': newCode } },
    );
    return result.matchedCount === 1;
  }

  async findByConfirmationCode(
    code: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    }).lean();
  }

  async findUserByRecoveryCode(
    code: string,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return UserModel.findOne({ 'recoveryData.recoveryCode': code }).lean();
  }
}
