import { Response } from 'express';

import { matchedData } from 'express-validator';
import { constants } from 'http2';
import { inject, injectable } from 'inversify';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { QueryBus } from '@/core/cqrs/buses/query-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import {
  PaginatedJsonApiResponse,
  PaginatedQueryResult,
  RequestWithBody,
  RequestWithParams,
  RequestWithQuery,
  SingleJsonApiResponse,
} from '@/core/types/common';
import { withPaginationDefaults } from '@/core/types/query-params';

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
import type { GetUsersArgs } from '../models/GetUsersInputModel';

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
    const query = withPaginationDefaults(
      matchedData(req, {
        locations: ['query'],
      }) as GetUsersArgs,
    );
    const { items, totalCount } = await this.queryBus.execute<
      PaginatedQueryResult<GetMappedUserOutputModel>
    >(
      new GetUsersQuery({
        searchLoginTerm: query.searchLoginTerm ?? null,
        searchEmailTerm: query.searchEmailTerm ?? null,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      }),
    );

    res.status(constants.HTTP_STATUS_OK).json(
      mapToUserListPaginatedOutput(items, {
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount,
      }),
    );
  }

  async createUser(
    req: RequestWithBody<CreateUserInputModel>,
    res: Response<SingleJsonApiResponse<Omit<GetMappedUserOutputModel, 'id'>>>,
  ) {
    const userId = await this.commandBus.execute<string>(
      new CreateUserCommand(req.body),
    );

    const viewModel = await this.queryBus.execute<GetMappedUserOutputModel>(
      new GetUserByIdQuery(userId),
    );

    res.status(constants.HTTP_STATUS_CREATED).json(mapToUserOutput(viewModel));
  }

  async deleteUser(
    req: RequestWithParams<DeleteUserInputModel>,
    res: Response,
  ) {
    await this.commandBus.execute(new DeleteUserCommand(req.params.id));
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
