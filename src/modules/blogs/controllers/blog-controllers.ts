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
  RequestWithParamsAndQuery,
  RequestWithQuery,
  SingleJsonApiResponse,
} from '@/core/types/common';
import { withPaginationDefaults } from '@/core/types/query-params';

import {
  type GetMappedPostOutputModel,
  GetPostByIdQuery,
  type GetPostOutputModel,
  type GetPostsArgs,
  type GetPostsInputModel,
  mapToPostListPaginatedOutput,
  mapToPostOutput,
} from '@/modules/posts';

import { CreateBlogCommand } from '../application/commands/create-blog.command';
import { CreatePostInBlogCommand } from '../application/commands/create-post-in-blog.command';
import { DeleteBlogCommand } from '../application/commands/delete-blog.command';
import { UpdateBlogCommand } from '../application/commands/update-blog.command';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { GetPostsInBlogQuery } from '../application/queries/get-posts-in-blog.query';
import {
  mapToBlogListPaginatedOutput,
  mapToBlogOutput,
} from '../helpers/map-to-blog-output';
import { CreateBlogInputModel } from '../models/CreateBlogInputModel';
import { CreatePostInBlogInputModel } from '../models/CreatePostInBlogInputModel';
import { GetBlogOutputModel } from '../models/GetBlogOutputModel';
import type { GetMappedBlogOutputModel } from '../models/GetBlogOutputModel';
import { GetBlogsInputModel } from '../models/GetBlogsInputModel';
import type { GetBlogsArgs } from '../models/GetBlogsInputModel';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';

@injectable()
export class BlogControllers {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
    @inject(CQRS_TYPES.QueryBus)
    protected queryBus: QueryBus,
  ) {}

  async getBlogs(
    req: RequestWithQuery<GetBlogsInputModel>,
    res: Response<PaginatedJsonApiResponse<GetBlogOutputModel>>,
  ) {
    const query = withPaginationDefaults(
      matchedData(req, {
        locations: ['query'],
      }) as GetBlogsArgs,
    );
    const { items, totalCount } = await this.queryBus.execute<
      PaginatedQueryResult<GetMappedBlogOutputModel>
    >(
      new GetBlogsQuery({
        searchNameTerm: query.searchNameTerm ?? null,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      }),
    );

    res.status(constants.HTTP_STATUS_OK).json(
      mapToBlogListPaginatedOutput(items, {
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount,
      }),
    );
  }

  async getBlog(
    req: RequestWithParams<{ id: string }>,
    res: Response<SingleJsonApiResponse<GetBlogOutputModel>>,
  ) {
    const resData = await this.queryBus.execute<GetMappedBlogOutputModel>(
      new GetBlogByIdQuery(req.params.id),
    );
    res.status(constants.HTTP_STATUS_OK).json(mapToBlogOutput(resData));
  }

  async getPostsOfBlog(
    req: RequestWithParamsAndQuery<{ id: string }, GetPostsInputModel>,
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
      new GetPostsInBlogQuery(req.params.id, {
        blogId: req.params.id,
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

  async createBlog(
    req: RequestWithBody<CreateBlogInputModel>,
    res: Response<SingleJsonApiResponse<GetBlogOutputModel>>,
  ) {
    const blogId = await this.commandBus.execute<string>(
      new CreateBlogCommand(req.body),
    );

    const viewModel = await this.queryBus.execute<GetMappedBlogOutputModel>(
      new GetBlogByIdQuery(blogId),
    );

    res.status(constants.HTTP_STATUS_CREATED).json(mapToBlogOutput(viewModel));
  }

  async createPostInBlog(
    req: RequestWithParamsAndBody<{ id: string }, CreatePostInBlogInputModel>,
    res: Response<SingleJsonApiResponse<GetPostOutputModel>>,
  ) {
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    const postId = await this.commandBus.execute<string>(
      new CreatePostInBlogCommand(req.params.id, req.body),
    );

    const viewModel = await this.queryBus.execute<GetMappedPostOutputModel>(
      new GetPostByIdQuery(postId, currentUserId),
    );

    res.status(constants.HTTP_STATUS_CREATED).json(mapToPostOutput(viewModel));
  }

  async updateBlog(
    req: RequestWithParamsAndBody<{ id: string }, UpdateBlogInputModel>,
    res: Response,
  ) {
    await this.commandBus.execute(
      new UpdateBlogCommand(req.params.id, req.body),
    );
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deleteBlog(
    req: RequestWithParams<{ id: string }>,
    res: Response<void>,
  ) {
    await this.commandBus.execute(new DeleteBlogCommand(req.params.id));
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
