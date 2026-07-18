import { Response } from 'express';

import { matchedData } from 'express-validator';
import { constants } from 'http2';
import { inject, injectable } from 'inversify';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { QueryBus } from '@/core/cqrs/buses/query-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { isFailure, sendFailure } from '@/core/result/handle-result';
import type { Result } from '@/core/result/result.type';
import {
  PaginatedJsonApiResponse,
  PaginatedQueryResult,
  RequestWithBody,
  RequestWithParams,
  RequestWithQuery,
  SingleJsonApiResponse,
  SortDirections,
} from '@/core/types/common';

import { CreateUserCommand } from '../application/commands/create-user.command';
import { DeleteUserCommand } from '../application/commands/delete-user.command';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { mapToUserListPaginatedOutput } from '../helpers/map-to-user-output';
import { mapToUserOutput } from '../helpers/map-to-user-output';
import { CreateUserInputModel } from '../models/CreateUserInputModel';
import { DeleteUserInputModel } from '../models/DeleteUserInputModel';
import { GetMappedUserOutputModel } from '../models/GetUserOutputModel';
import { GetUsersInputModel } from '../models/GetUsersInputModel';

@injectable()
export class UserControllers {
  constructor(
    @inject(CQRS_TYPES.QueryBus)
    protected queryBus: QueryBus,
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
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
    const { items, totalCount } = await this.queryBus.execute<
      PaginatedQueryResult<GetMappedUserOutputModel>
    >(
      new GetUsersQuery({
        searchLoginTerm: query.searchLoginTerm ?? null,
        searchEmailTerm: query.searchEmailTerm ?? null,
        sortBy: query.sortBy ?? 'createdAt',
        sortDirection: query.sortDirection ?? SortDirections.desc,
        pageNumber: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 10,
      }),
    );

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
    const result = await this.commandBus.execute<Result<string>>(
      new CreateUserCommand(req.body),
    );
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const viewModel =
      await this.queryBus.execute<GetMappedUserOutputModel | null>(
        new GetUserByIdQuery(result.data!),
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
    const result = await this.commandBus.execute<Result<null>>(
      new DeleteUserCommand(req.params.id),
    );
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
