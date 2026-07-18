import { Response } from 'express';

import { matchedData } from 'express-validator';
import { constants } from 'http2';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { isFailure, sendFailure } from '@/core/result/handle-result';
import {
  PaginatedJsonApiResponse,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
  SingleJsonApiResponse,
  SortDirections,
} from '@/core/types/common';

import {
  mapToPostListPaginatedOutput,
  mapToPostOutput,
} from '../../posts/helpers/map-to-post-output';
import type { GetPostOutputModel } from '../../posts/models/GetPostOutputModel';
import type { GetPostsInputModel } from '../../posts/models/GetPostsInputModel';
import { PostsService } from '../../posts/services/posts-service';
import {
  mapToBlogListPaginatedOutput,
  mapToBlogOutput,
} from '../helpers/map-to-blog-output';
import { CreateBlogInputModel } from '../models/CreateBlogInputModel';
import { CreatePostInBlogInputModel } from '../models/CreatePostInBlogInputModel';
import { GetBlogOutputModel } from '../models/GetBlogOutputModel';
import { GetBlogsInputModel } from '../models/GetBlogsInputModel';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import { BlogsService } from '../services/blogs-service';

@injectable()
export class BlogControllers {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
  ) {}

  async getBlogs(
    req: RequestWithQuery<GetBlogsInputModel>,
    res: Response<PaginatedJsonApiResponse<GetBlogOutputModel>>,
  ) {
    const query = matchedData(req, {
      locations: ['query'],
    }) as GetBlogsInputModel;
    const { items, totalCount } = await this.blogsService.findMany({
      searchNameTerm: query.searchNameTerm ?? null,
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? SortDirections.desc,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
    });

    res.status(constants.HTTP_STATUS_OK).json(
      mapToBlogListPaginatedOutput(items, {
        page: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 10,
        totalCount,
      }),
    );
  }

  async getBlog(
    req: RequestWithParams<{ id: string }>,
    res: Response<SingleJsonApiResponse<GetBlogOutputModel>>,
  ) {
    const resData = await this.blogsService.findById(req.params.id);
    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }
    res.status(constants.HTTP_STATUS_OK).json(mapToBlogOutput(resData));
  }

  async getPostsOfBlog(
    req: RequestWithParamsAndQuery<{ id: string }, GetPostsInputModel>,
    res: Response<PaginatedJsonApiResponse<GetPostOutputModel>>,
  ) {
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    const query = matchedData(req, {
      locations: ['query'],
    }) as GetPostsInputModel;
    const resData = await this.blogsService.findPostsInBlog(req.params.id, {
      blogId: req.params.id,
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? SortDirections.desc,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
      currentUserId,
    });

    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    const { items, totalCount } = resData;

    res.status(constants.HTTP_STATUS_OK).json(
      mapToPostListPaginatedOutput(items, {
        page: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 10,
        totalCount,
      }),
    );
  }

  async createBlog(
    req: RequestWithBody<CreateBlogInputModel>,
    res: Response<SingleJsonApiResponse<GetBlogOutputModel>>,
  ) {
    const result = await this.blogsService.createBlog(req.body);
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const viewModel = await this.blogsService.findById(result.data!);
    if (!viewModel) {
      res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      return;
    }

    res.status(constants.HTTP_STATUS_CREATED).json(mapToBlogOutput(viewModel));
  }

  async createPostInBlog(
    req: RequestWithParamsAndBody<{ id: string }, CreatePostInBlogInputModel>,
    res: Response<SingleJsonApiResponse<GetPostOutputModel>>,
  ) {
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    const result = await this.blogsService.createPostInBlog({
      blogId: req.params.id,
      input: req.body,
    });

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const viewModel = await this.postsService.findById(
      result.data!,
      currentUserId,
    );
    if (!viewModel) {
      res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      return;
    }

    res.status(constants.HTTP_STATUS_CREATED).json(mapToPostOutput(viewModel));
  }

  async updateBlog(
    req: RequestWithParamsAndBody<{ id: string }, UpdateBlogInputModel>,
    res: Response,
  ) {
    const result = await this.blogsService.updateBlog({
      id: req.params.id,
      input: req.body,
    });
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deleteBlog(
    req: RequestWithParams<{ id: string }>,
    res: Response<void>,
  ) {
    const result = await this.blogsService.deleteBlogById(req.params.id);
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
