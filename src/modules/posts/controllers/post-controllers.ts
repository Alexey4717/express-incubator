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
  RequestWithQuery,
  SingleJsonApiResponse,
  SortDirections,
} from '@/core/types/common';

import { mapToCommentListPaginatedOutput } from '../../comments/helpers/map-to-comment-output';
import { mapToCommentOutput } from '../../comments/helpers/map-to-comment-output';
import type { CreateCommentInputModel } from '../../comments/models/CreateCommentInputModel';
import { GetPostsInputModel as GetPostCommentsQuery } from '../../comments/models/GetPostCommentsInputModel';
import { CommentsService } from '../../comments/services/comments-service';
import {
  mapToPostListPaginatedOutput,
  mapToPostOutput,
} from '../helpers/map-to-post-output';
import { CreatePostInputModel } from '../models/CreatePostInputModel';
import { GetPostInputModel } from '../models/GetPostInputModel';
import { GetPostLikeStatusInputModel } from '../models/GetPostLikeStatusInputModel';
import { GetPostOutputModel } from '../models/GetPostOutputModel';
import { GetPostsInputModel } from '../models/GetPostsInputModel';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { UpdatePostLikeStatusInputModel } from '../models/UpdatePostLikeStatusInputModel';
import { PostsService } from '../services/posts-service';

@injectable()
export class PostControllers {
  constructor(
    protected postsService: PostsService,
    protected commentsService: CommentsService,
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
    }) as GetPostsInputModel;
    const { items, totalCount } = await this.postsService.findMany({
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? SortDirections.desc,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
      currentUserId,
    });

    res.status(constants.HTTP_STATUS_OK).json(
      mapToPostListPaginatedOutput(items, {
        page: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 10,
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

    const resData = await this.postsService.findById(
      req.params.id,
      currentUserId,
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
      GetPostCommentsQuery,
      'postId'
    >;

    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req?.context?.user?._id)?.toString()
      : undefined;

    const resData = await this.commentsService.findPostComments({
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? SortDirections.desc,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
      postId,
      currentUserId,
    });

    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    const { items, totalCount } = resData;

    res.status(constants.HTTP_STATUS_OK).json(
      mapToCommentListPaginatedOutput(items, {
        page: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 10,
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

    const result = await this.postsService.createPost(req.body);

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

  async createCommentInPost(
    req: RequestWithParamsAndBody<{ postId: string }, CreateCommentInputModel>,
    res: Response,
  ) {
    if (!req.context.user) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const currentUserId = req.context.user._id.toString();
    const result = await this.commentsService.createCommentInPost({
      postId: req.params.postId,
      content: req.body.content,
      userId: currentUserId,
      userLogin: req.context.user.accountData.login,
    });

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const viewModel = await this.commentsService.findById(
      result.data!,
      currentUserId,
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
    const result = await this.postsService.updatePost({
      id: req.params.id,
      input: req.body,
    });
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

    const result = await this.postsService.updatePostLikeStatus({
      postId: req.params.postId,
      likeStatus: req.body.likeStatus,
      userId,
      userLogin,
    });

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deletePost(req: RequestWithParams<GetPostInputModel>, res: Response) {
    const result = await this.postsService.deletePostById(req.params.id);
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
