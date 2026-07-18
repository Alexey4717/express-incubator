import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CreateUserInsertToDBModel } from '../../models/CreateUserInsertToDBModel';
import { TUserDb } from '../../models/GetUserOutputModel';
import UserModel from '../../models/User-model';
import {
  ChangeUserPasswordArgs,
  SetUserRecoveryDataInputType,
  UpdateUserConfirmationCodeInputType,
} from './types';

@injectable()
export class UsersRepository {
  async getUserById(id: string): Promise<TUserDb | null> {
    try {
      return await UserModel.findOne({ _id: new ObjectId(id) }).lean();
    } catch (error) {
      console.log(`UsersRepository.getUserById error is occurred: ${error}`);
      return null;
    }
  }

  async createUser(
    newUser: CreateUserInsertToDBModel,
  ): Promise<ObjectId | null> {
    try {
      const result = await UserModel.create(newUser);
      return result._id ?? null;
    } catch (error) {
      console.log(`UsersRepository.createUser error is occurred: ${error}`);
      return null;
    }
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
}
