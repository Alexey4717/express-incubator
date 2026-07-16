import { injectable } from 'inversify';
import { Filter, ObjectId } from 'mongodb';

import { calculateAndGetSkipValue } from '../../../../core/helpers';
import {
  GetUsersArgs,
  Paginator,
  SortDirections,
} from '../../../../core/types/common';
import { GetUserOutputModelFromMongoDB } from '../../../users/models/UserModels/GetUserOutputModel';
import UserModel from '../../../users/models/UserModels/User-model';

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
  }: GetUsersArgs): Promise<Paginator<GetUserOutputModelFromMongoDB[]>> {
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
      const pagesCount = Math.ceil(totalCount / pageSize);
      return {
        page: pageNumber,
        pageSize,
        totalCount,
        pagesCount,
        items,
      };
    } catch (error) {
      console.log(`UsersQueryRepository.getUsers error is occurred: ${error}`);
      return {} as Paginator<GetUserOutputModelFromMongoDB[]>;
    }
  }

  async findUserById(
    id: ObjectId,
  ): Promise<GetUserOutputModelFromMongoDB | null> {
    return await UserModel.findOne({ _id: new ObjectId(id) }).lean();
  }
}
