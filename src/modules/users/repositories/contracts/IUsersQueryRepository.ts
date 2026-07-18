import { ObjectId } from 'mongodb';

import { PaginatedQueryResult } from '@/core/types/common';

import {
  GetMappedUserOutputModel,
  TUserDb,
} from '../../models/GetUserOutputModel';
import type { GetUsersArgs } from '../../models/GetUsersInputModel';

export interface IUsersQueryRepository {
  getUsers(
    args: GetUsersArgs,
  ): Promise<PaginatedQueryResult<GetMappedUserOutputModel>>;
  findUserById(id: ObjectId): Promise<TUserDb | null>;
  findUserViewById(id: string): Promise<GetMappedUserOutputModel | null>;
  findByLoginOrEmail(loginOrEmail: string): Promise<TUserDb | null>;
  findByConfirmationCode(code: string): Promise<TUserDb | null>;
  findUserByRecoveryCode(code: string): Promise<TUserDb | null>;
}
