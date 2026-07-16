import { Response } from 'express';

import { constants } from 'http2';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import {
  getMappedCommentViewModel,
  getMappedPostViewModel,
} from '../../../core/helpers';
import {
  Paginator,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  SortDirections,
} from '../../../core/types/common';
import { CreateCommentInputModel } from '../../comments/models/CommentsModels/CreateCommentInputModel';
import { SortPostCommentsBy } from '../../comments/models/CommentsModels/GetPostCommentsInputModel';
import { CommentsQueryRepository } from '../../comments/repositories/Queries/comments-query-repository';
import { CommentsService } from '../../comments/services/comments-service';
import { CreatePostInputModel } from '../../posts/models/PostModels/CreatePostInputModel';
import { GetPostInputModel } from '../../posts/models/PostModels/GetPostInputModel';
import { GetPostLikeStatusInputModel } from '../../posts/models/PostModels/GetPostLikeStatusInputModel';
import {
  GetMappedPostOutputModel,
  GetPostOutputModel,
} from '../../posts/models/PostModels/GetPostOutputModel';
import {
  GetPostsInputModel,
  SortPostsBy,
} from '../../posts/models/PostModels/GetPostsInputModel';
import { UpdatePostInputModel } from '../../posts/models/PostModels/UpdatePostInputModel';
import { UpdatePostLikeStatusInputModel } from '../../posts/models/PostModels/UpdatePostLikeStatusInputModel';
import { PostsQueryRepository } from '../../posts/repositories/Queries/posts-query-repository';
import { PostsService } from '../services/posts-service';

@injectable()
export class PostControllers {
  constructor(
    protected postsQueryRepository: PostsQueryRepository,
    protected postsService: PostsService,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
  ) {}

  async getPosts(
    req: RequestWithQuery<GetPostsInputModel>,
    res: Response<Paginator<GetMappedPostOutputModel[]>>,
  ) {
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    const resData = await this.postsQueryRepository.getPosts({
      sortBy: (req.query.sortBy?.toString() || 'createdAt') as SortPostsBy, // by-default createdAt
      sortDirection: (req.query.sortDirection?.toString() ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(req.query.pageNumber || 1), // by-default 1
      pageSize: +(req.query.pageSize || 10), // by-default 10
    });
    const { pagesCount, page, pageSize, totalCount, items } = resData || {};
    const itemsWithCurrentUserId = items.map((item) => ({
      ...item,
      currentUserId,
    }));
    res.status(constants.HTTP_STATUS_OK).json({
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: itemsWithCurrentUserId.map(getMappedPostViewModel),
    });
  }

  async getPost(
    req: RequestWithParams<GetPostInputModel>,
    res: Response<GetPostOutputModel>,
  ) {
    const resData = await this.postsQueryRepository.findPostById(req.params.id);
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req.context.user?._id).toString()
      : undefined;

    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }
    res.status(constants.HTTP_STATUS_OK).json(
      getMappedPostViewModel({
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

    const resData = await this.commentsQueryRepository.getPostComments({
      sortBy: (req.query.sortBy?.toString() ||
        'createdAt') as SortPostCommentsBy, // by-default createdAt
      sortDirection: (req.query.sortDirection?.toString() ||
        SortDirections.desc) as SortDirections, // by-default desc
      pageNumber: +(req.query.pageNumber || 1), // by-default 1
      pageSize: +(req.query.pageSize || 10), // by-default 10
      postId,
    });

    if (!resData) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    const { pagesCount, page, pageSize, totalCount, items } = resData || {};

    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req?.context?.user?._id)?.toString()
      : undefined;

    const itemsWithCurrentUserID = items.map((item) => ({
      ...item,
      currentUserId,
    }));

    res.status(constants.HTTP_STATUS_OK).json({
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: itemsWithCurrentUserID.map(getMappedCommentViewModel),
    });
  }

  async createPost(
    req: RequestWithBody<CreatePostInputModel>,
    res: Response<GetPostOutputModel>,
  ) {
    const currentUserId = req.context?.user?._id
      ? new ObjectId(req.context.user._id).toString()
      : undefined;

    const createdPost = await this.postsService.createPost(req.body);

    // Если указан невалидный blogId
    if (!createdPost) {
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
      return;
    }
    res.status(constants.HTTP_STATUS_CREATED).json(createdPost);
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

    // Если не найден пост
    if (!createdCommentInPost) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    res.status(201).json(createdCommentInPost);
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
