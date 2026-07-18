import { injectable } from 'inversify';
import { Filter, ObjectId } from 'mongodb';

import { calculateAndGetSkipValue } from '@/core/helpers';
import { PaginatedQueryResult, SortDirections } from '@/core/types/common';

import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';
import type { GetUsersArgs } from '../../models/GetUsersInputModel';
import UserModel from '../../models/User-model';

const userSortFieldMap: Record<string, string> = {
  login: 'accountData.login',
  email: 'accountData.email',
  createdAt: 'accountData.createdAt',
};

@injectable()
export class UsersQueryRepository {
  async getUsers({
    searchLoginTerm,
    searchEmailTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetUsersArgs): Promise<
    PaginatedQueryResult<GetUserOutputModelFromMongoDB>
  > {
    try {
      let filter: Filter<GetUserOutputModelFromMongoDB> = {};

      if (searchLoginTerm && !searchEmailTerm) {
        filter['accountData.login'] = {
          $regex: searchLoginTerm,
          $options: 'i',
        };
      } else if (searchEmailTerm && !searchLoginTerm) {
        filter['accountData.email'] = {
          $regex: searchEmailTerm,
          $options: 'i',
        };
      } else if (searchLoginTerm && searchEmailTerm) {
        filter = {
          $or: [
            {
              'accountData.login': {
                $regex: searchLoginTerm,
                $options: 'i',
              },
            },
            {
              'accountData.email': {
                $regex: searchEmailTerm,
                $options: 'i',
              },
            },
          ],
        };
      }

      const sortField = userSortFieldMap[sortBy] ?? 'accountData.createdAt';
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const items = await UserModel.find(filter)
        .sort({
          [sortField]: sortDirection === SortDirections.desc ? -1 : 1,
        })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await UserModel.countDocuments(filter);
      return { items, totalCount };
    } catch (error) {
      console.log(`UsersQueryRepository.getUsers error is occurred: ${error}`);
      return { items: [], totalCount: 0 };
    }
  }

  async findUserById(
    id: ObjectId,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return await UserModel.findOne({ _id: new ObjectId(id) }).lean();
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
