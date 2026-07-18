import { Response } from 'express';

import { matchedData } from 'express-validator';
import { constants } from 'http2';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

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
    });

    const itemsWithCurrentUserId = items.map((item) => ({
      ...item,
      currentUserId,
    }));

    res.status(constants.HTTP_STATUS_OK).json(
      mapToPostListPaginatedOutput(itemsWithCurrentUserId, {
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
    const resData = await this.postsService.findById(req.params.id);
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }
    res.status(constants.HTTP_STATUS_OK).json(
      mapToPostOutput({
        ...resData,
        currentUserId,
      }),
    );
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

    const resData = await this.commentsService.findPostComments({
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? SortDirections.desc,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
      postId,
    });

    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    const { items, totalCount } = resData;

    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req?.context?.user?._id)?.toString()
      : undefined;

    const itemsWithCurrentUserID = items.map((item) => ({
      ...item,
      currentUserId,
    }));

    res.status(constants.HTTP_STATUS_OK).json(
      mapToCommentListPaginatedOutput(itemsWithCurrentUserID, {
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
    const createdPost = await this.postsService.createPost(req.body);

    if (!createdPost) {
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
      return;
    }
    res
      .status(constants.HTTP_STATUS_CREATED)
      .json(mapToPostOutput(createdPost));
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
    const createdCommentInPost = await this.commentsService.createCommentInPost(
      {
        postId: req.params.postId,
        content: req.body.content,
        userId: currentUserId,
        userLogin: req.context.user.accountData.login,
      },
    );

    if (!createdCommentInPost) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    res.status(201).json(mapToCommentOutput(createdCommentInPost));
  }

  async updatePost(
    req: RequestWithParamsAndBody<GetPostInputModel, UpdatePostInputModel>,
    res: Response,
  ) {
    const isPostUpdated = await this.postsService.updatePost({
      id: req.params.id,
      input: req.body,
    });
    if (!isPostUpdated) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
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

    const isPostUpdated = await this.postsService.updatePostLikeStatus({
      postId: req.params.postId,
      likeStatus: req.body.likeStatus,
      userId,
      userLogin,
    });

    if (!isPostUpdated) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deletePost(req: RequestWithParams<GetPostInputModel>, res: Response) {
    const resData = await this.postsService.deletePostById(req.params.id);
    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
