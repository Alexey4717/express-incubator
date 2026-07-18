import { ObjectId } from 'mongodb';

import { UserEntity } from '../../domain/entities/user.entity';

export interface IUsersRepository {
  getUserById(id: string): Promise<UserEntity | null>;
  createUser(user: UserEntity): Promise<ObjectId | null>;
  save(user: UserEntity): Promise<boolean>;
  deleteUserById(id: string): Promise<boolean>;
}
