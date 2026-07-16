import { Response } from 'express';

import { constants } from 'http2';
import { injectable } from 'inversify';

import { getMappedUserViewModel } from '@/core/helpers';
import {
  Paginator,
  RequestWithBody,
  RequestWithParams,
  RequestWithQuery,
  SortDirections,
} from '@/core/types/common';

import { AuthService } from '../../auth/services/auth-service';
import { CreateUserInputModel } from '../models/CreateUserInputModel';
import { DeleteUserInputModel } from '../models/DeleteUserInputModel';
import { GetMappedUserOutputModel } from '../models/GetUserOutputModel';
import { GetUsersInputModel, SortUsersBy } from '../models/GetUsersInputModel';
import { UsersQueryRepository } from '../repositories/Queries/users-query-repository';

@injectable()
export class UserControllers {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected authService: AuthService,
  ) {}

  async getUsers(
    req: RequestWithQuery<GetUsersInputModel>,
    res: Response<Paginator<GetMappedUserOutputModel[]>>,
  ) {
    const resData = await this.usersQueryRepository.getUsers({
      searchLoginTerm: req.query.searchLoginTerm?.toString() || null, // by-default null
      searchEmailTerm: req.query.searchEmailTerm?.toString() || null, // by-default null
      sortBy: (req.query.sortBy?.toString() || 'createdAt') as SortUsersBy, // by-default createdAt
      sortDirection: (req.query.sortDirection?.toString() ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(req.query.pageNumber || 1), // by-default 1
      pageSize: +(req.query.pageSize || 10), // by-default 10
    });
    const { pagesCount, page, pageSize, totalCount, items } = resData || {};
    res.status(constants.HTTP_STATUS_OK).json({
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(getMappedUserViewModel),
    });
  }

  async createUser(
    req: RequestWithBody<CreateUserInputModel>,
    res: Response<GetMappedUserOutputModel>,
  ) {
    const createdUser = await this.authService.createUser(req.body);
    res
      .status(constants.HTTP_STATUS_CREATED)
      .json(getMappedUserViewModel(createdUser));
  }

  async deleteUser(
    req: RequestWithParams<DeleteUserInputModel>,
    res: Response,
  ) {
    const resData = await this.authService.deleteUserById(req.params.id);
    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
