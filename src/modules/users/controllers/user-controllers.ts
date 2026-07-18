import { Response } from 'express';

import { matchedData } from 'express-validator';
import { constants } from 'http2';
import { inject, injectable } from 'inversify';

import { isFailure, sendFailure } from '@/core/result/handle-result';
import {
  PaginatedJsonApiResponse,
  RequestWithBody,
  RequestWithParams,
  RequestWithQuery,
  SingleJsonApiResponse,
  SortDirections,
} from '@/core/types/common';

import { AuthService } from '../../auth/services/auth-service';
import { mapToUserListPaginatedOutput } from '../helpers/map-to-user-output';
import { mapToUserOutput } from '../helpers/map-to-user-output';
import { CreateUserInputModel } from '../models/CreateUserInputModel';
import { DeleteUserInputModel } from '../models/DeleteUserInputModel';
import { GetMappedUserOutputModel } from '../models/GetUserOutputModel';
import { GetUsersInputModel } from '../models/GetUsersInputModel';
import type { IUsersQueryRepository } from '../repositories/contracts/IUsersQueryRepository';
import { UsersService } from '../services/users-service';
import { USERS_TYPES } from '../users.tokens';

@injectable()
export class UserControllers {
  constructor(
    protected usersService: UsersService,
    protected authService: AuthService,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
  ) {}

  async getUsers(
    req: RequestWithQuery<GetUsersInputModel>,
    res: Response<
      PaginatedJsonApiResponse<Omit<GetMappedUserOutputModel, 'id'>>
    >,
  ) {
    const query = matchedData(req, {
      locations: ['query'],
    }) as GetUsersInputModel;
    const { items, totalCount } = await this.usersService.findMany({
      searchLoginTerm: query.searchLoginTerm ?? null,
      searchEmailTerm: query.searchEmailTerm ?? null,
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? SortDirections.desc,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
    });

    res.status(constants.HTTP_STATUS_OK).json(
      mapToUserListPaginatedOutput(items, {
        page: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 10,
        totalCount,
      }),
    );
  }

  async createUser(
    req: RequestWithBody<CreateUserInputModel>,
    res: Response<SingleJsonApiResponse<Omit<GetMappedUserOutputModel, 'id'>>>,
  ) {
    const result = await this.authService.createUser(req.body);
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const viewModel = await this.usersQueryRepository.findUserViewById(
      result.data!,
    );
    if (!viewModel) {
      res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      return;
    }

    res.status(constants.HTTP_STATUS_CREATED).json(mapToUserOutput(viewModel));
  }

  async deleteUser(
    req: RequestWithParams<DeleteUserInputModel>,
    res: Response,
  ) {
    const result = await this.authService.deleteUserById(req.params.id);
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
