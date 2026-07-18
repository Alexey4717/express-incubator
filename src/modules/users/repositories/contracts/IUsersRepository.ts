import { ObjectId } from 'mongodb';

import { CreateUserInsertToDBModel } from '../../models/CreateUserInsertToDBModel';
import { TUserDb } from '../../models/GetUserOutputModel';
import {
  ChangeUserPasswordArgs,
  SetUserRecoveryDataInputType,
  UpdateUserConfirmationCodeInputType,
} from '../CUD/types';

export interface IUsersRepository {
  getUserById(id: string): Promise<TUserDb | null>;
  createUser(newUser: CreateUserInsertToDBModel): Promise<ObjectId | null>;
  deleteUserById(id: string): Promise<boolean>;
  updateConfirmation(userId: ObjectId): Promise<boolean>;
  changeUserPasswordAndNullifyRecoveryData(
    args: ChangeUserPasswordArgs,
  ): Promise<boolean>;
  setUserRecoveryData(args: SetUserRecoveryDataInputType): Promise<boolean>;
  updateUserConfirmationCode(
    args: UpdateUserConfirmationCodeInputType,
  ): Promise<boolean>;
}
