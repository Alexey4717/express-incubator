import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { UserEntity } from '../../domain/entities/user.entity';
import { UserPersistenceMapper } from '../../domain/mappers/user.persistence-mapper';
import UserModel from '../../models/User-model';
import type { IUsersRepository } from '../contracts/IUsersRepository';

@injectable()
export class UsersRepository implements IUsersRepository {
  async getUserById(id: string): Promise<UserEntity | null> {
    try {
      const raw = await UserModel.findOne({ _id: new ObjectId(id) }).lean();
      return raw ? UserPersistenceMapper.toDomain(raw) : null;
    } catch (error) {
      console.log(`UsersRepository.getUserById error is occurred: ${error}`);
      return null;
    }
  }

  async createUser(user: UserEntity): Promise<ObjectId | null> {
    try {
      const data = UserPersistenceMapper.toPersistence(user);
      const result = await UserModel.create(data);
      return result._id ?? null;
    } catch (error) {
      console.log(`UsersRepository.createUser error is occurred: ${error}`);
      return null;
    }
  }

  async save(user: UserEntity): Promise<boolean> {
    try {
      const data = UserPersistenceMapper.toPersistence(user);
      const result = await UserModel.updateOne(
        { _id: data._id },
        {
          $set: {
            accountData: data.accountData,
            emailConfirmation: data.emailConfirmation,
            recoveryData: data.recoveryData,
          },
        },
      );
      return result.matchedCount === 1;
    } catch (error) {
      console.log(`UsersRepository.save error is occurred: ${error}`);
      return false;
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
}
