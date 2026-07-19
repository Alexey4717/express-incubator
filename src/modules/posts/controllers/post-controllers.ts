import { Response } from 'express';

import { matchedData } from 'express-validator';
import { constants } from 'http2';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { QueryBus } from '@/core/cqrs/buses/query-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import {
  PaginatedJsonApiResponse,
  PaginatedQueryResult,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  SingleJsonApiResponse,
} from '@/core/types/common';
import { withPaginationDefaults } from '@/core/types/query-params';

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

    const query = withPaginationDefaults(
      matchedData(req, {
        locations: ['query'],
      }) as GetPostsArgs,
    );
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

    const resData = await this.queryBus.execute<GetMappedPostOutputModel>(
      new GetPostByIdQuery(req.params.id, currentUserId),
    );

    res.status(constants.HTTP_STATUS_OK).json(mapToPostOutput(resData));
  }

  async getCommentsOfPost(
    req: RequestWithParams<{ postId: string }>,
    res: Response,
  ) {
    const postId = req.params.postId;
    const query = withPaginationDefaults(
      matchedData(req, { locations: ['query'] }) as Omit<
        GetPostCommentsQueryModel,
        'postId'
      >,
    );

    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req?.context?.user?._id)?.toString()
      : undefined;

    const { items, totalCount } = await this.queryBus.execute<
      PaginatedQueryResult<GetMappedCommentOutputModel>
    >(
      new GetPostCommentsQuery({
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        postId,
        currentUserId,
      }),
    );

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

    const postId = await this.commandBus.execute<string>(
      new CreatePostCommand(req.body),
    );

    const viewModel = await this.queryBus.execute<GetMappedPostOutputModel>(
      new GetPostByIdQuery(postId, currentUserId),
    );

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
    const commentId = await this.commandBus.execute<string>(
      new CreateCommentCommand(
        req.params.postId,
        currentUserId,
        req.context.user.accountData.login,
        req.body.content,
      ),
    );

    const viewModel = await this.queryBus.execute<GetMappedCommentOutputModel>(
      new GetCommentByIdQuery(commentId, currentUserId),
    );

    res.status(201).json(mapToCommentOutput(viewModel));
  }

  async updatePost(
    req: RequestWithParamsAndBody<GetPostInputModel, UpdatePostInputModel>,
    res: Response,
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand(req.params.id, req.body),
    );
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

    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(
        req.params.postId,
        userId,
        userLogin,
        req.body.likeStatus,
      ),
    );

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deletePost(req: RequestWithParams<GetPostInputModel>, res: Response) {
    await this.commandBus.execute(new DeletePostCommand(req.params.id));
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
