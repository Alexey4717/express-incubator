import { Response } from 'express';

import { matchedData } from 'express-validator';
import { constants } from 'http2';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

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
  RequestWithParamsAndBody,
  RequestWithQuery,
  SingleJsonApiResponse,
} from '@/core/types/common';

import {
  CreateCommentCommand,
  type CreateCommentInputModel,
  GetCommentByIdQuery,
  type GetMappedCommentOutputModel,
  GetPostCommentsQuery,
  type GetPostCommentsQueryModel,
  mapToCommentListPaginatedOutput,
  mapToCommentOutput,
} from '@/modules/comments';

import { CreatePostCommand } from '../application/commands/create-post.command';
import { DeletePostCommand } from '../application/commands/delete-post.command';
import { UpdatePostLikeStatusCommand } from '../application/commands/update-post-like-status.command';
import { UpdatePostCommand } from '../application/commands/update-post.command';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query';
import { GetPostsQuery } from '../application/queries/get-posts.query';
import {
  mapToPostListPaginatedOutput,
  mapToPostOutput,
} from '../helpers/map-to-post-output';
import { CreatePostInputModel } from '../models/CreatePostInputModel';
import { GetPostInputModel } from '../models/GetPostInputModel';
import { GetPostLikeStatusInputModel } from '../models/GetPostLikeStatusInputModel';
import { GetPostOutputModel } from '../models/GetPostOutputModel';
import type { GetMappedPostOutputModel } from '../models/GetPostOutputModel';
import { GetPostsInputModel } from '../models/GetPostsInputModel';
import type { GetPostsArgs } from '../models/GetPostsInputModel';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { UpdatePostLikeStatusInputModel } from '../models/UpdatePostLikeStatusInputModel';

@injectable()
export class PostControllers {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
    @inject(CQRS_TYPES.QueryBus)
    protected queryBus: QueryBus,
  ) {}

  async getPosts(
    req: RequestWithQuery<GetPostsInputModel>,
    res: Response<PaginatedJsonApiResponse<GetPostOutputModel>>,
  ) {
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    const query = matchedData(req, {
      locations: ['query'],
    }) as GetPostsArgs;
    const { items, totalCount } = await this.queryBus.execute<
      PaginatedQueryResult<GetMappedPostOutputModel>
    >(
      new GetPostsQuery({
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        currentUserId,
      }),
    );

    res.status(constants.HTTP_STATUS_OK).json(
      mapToPostListPaginatedOutput(items, {
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount,
      }),
    );
  }

  async getPost(
    req: RequestWithParams<GetPostInputModel>,
    res: Response<SingleJsonApiResponse<GetPostOutputModel>>,
  ) {
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    const resData =
      await this.queryBus.execute<GetMappedPostOutputModel | null>(
        new GetPostByIdQuery(req.params.id, currentUserId),
      );

    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }
    res.status(constants.HTTP_STATUS_OK).json(mapToPostOutput(resData));
  }

  async getCommentsOfPost(
    req: RequestWithParams<{ postId: string }>,
    res: Response,
  ) {
    const postId = req.params.postId;
    const query = matchedData(req, { locations: ['query'] }) as Omit<
      GetPostCommentsQueryModel,
      'postId'
    >;

    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req?.context?.user?._id)?.toString()
      : undefined;

    const resData =
      await this.queryBus.execute<PaginatedQueryResult<GetMappedCommentOutputModel> | null>(
        new GetPostCommentsQuery({
          sortBy: query.sortBy,
          sortDirection: query.sortDirection,
          pageNumber: query.pageNumber,
          pageSize: query.pageSize,
          postId,
          currentUserId,
        }),
      );

    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    const { items, totalCount } = resData;

    res.status(constants.HTTP_STATUS_OK).json(
      mapToCommentListPaginatedOutput(items, {
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount,
      }),
    );
  }

  async createPost(
    req: RequestWithBody<CreatePostInputModel>,
    res: Response<SingleJsonApiResponse<GetPostOutputModel>>,
  ) {
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    const result = await this.commandBus.execute<Result<string>>(
      new CreatePostCommand(req.body),
    );

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const viewModel =
      await this.queryBus.execute<GetMappedPostOutputModel | null>(
        new GetPostByIdQuery(result.data!, currentUserId),
      );
    if (!viewModel) {
      res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      return;
    }

    res.status(constants.HTTP_STATUS_CREATED).json(mapToPostOutput(viewModel));
  }

  async createCommentInPost(
    req: RequestWithParamsAndBody<{ postId: string }, CreateCommentInputModel>,
    res: Response,
  ) {
    if (!req.context.user) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const currentUserId = req.context.user._id.toString();
    const result = await this.commandBus.execute<Result<string>>(
      new CreateCommentCommand(
        req.params.postId,
        currentUserId,
        req.context.user.accountData.login,
        req.body.content,
      ),
    );

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const viewModel =
      await this.queryBus.execute<GetMappedCommentOutputModel | null>(
        new GetCommentByIdQuery(result.data!, currentUserId),
      );
    if (!viewModel) {
      res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      return;
    }

    res.status(201).json(mapToCommentOutput(viewModel));
  }

  async updatePost(
    req: RequestWithParamsAndBody<GetPostInputModel, UpdatePostInputModel>,
    res: Response,
  ) {
    const result = await this.commandBus.execute<Result<null>>(
      new UpdatePostCommand(req.params.id, req.body),
    );
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async updatePostLikeStatus(
    req: RequestWithParamsAndBody<
      GetPostLikeStatusInputModel,
      UpdatePostLikeStatusInputModel
    >,
    res: Response,
  ) {
    const userId = new ObjectId(req.context.user!._id).toString();
    const userLogin = req.context.user!.accountData.login;

    const result = await this.commandBus.execute<Result<null>>(
      new UpdatePostLikeStatusCommand(
        req.params.postId,
        userId,
        userLogin,
        req.body.likeStatus,
      ),
    );

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deletePost(req: RequestWithParams<GetPostInputModel>, res: Response) {
    const result = await this.commandBus.execute<Result<null>>(
      new DeletePostCommand(req.params.id),
    );
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
