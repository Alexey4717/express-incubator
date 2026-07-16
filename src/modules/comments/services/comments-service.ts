import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CommentManageStatuses } from '@/core/types/common';
import { LikeStatus } from '@/core/types/common';

import { PostsQueryRepository } from '../../posts/repositories/Queries/posts-query-repository';
import {
  GetMappedCommentOutputModel,
  TCommentDb,
} from '../models/GetCommentOutputModel';
import { CommentsRepository } from '../repositories/CUD/comments-repository';
import { CommentsQueryRepository } from '../repositories/Queries/comments-query-repository';

interface CreateCommentInput {
  postId: string;
  userId: string;
  userLogin: string;
  content: string;
}

interface UpdateCommentArgs {
  id: string;
  content: string;
}

interface DeleteCommentArgs {
  commentId: string;
  userId: string;
}

interface UpdateCommentLikeStatusArgs {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}

@injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  _mapCommentToViewType(comment: TCommentDb): GetMappedCommentOutputModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    };
  }

  async createCommentInPost(
    input: CreateCommentInput,
  ): Promise<GetMappedCommentOutputModel | null> {
    const { postId, content, userId, userLogin } = input;
    const foundPost = await this.postsQueryRepository.findPostById(postId);
    if (!foundPost) return null;

    const newComment: TCommentDb = {
      _id: new ObjectId(),
      postId,
      content,
      commentatorInfo: { userId, userLogin },
      createdAt: new Date().toISOString(),
      reactions: [],
    };
    const result =
      await this.commentsRepository.createCommentInPost(newComment);
    if (!result) return null;
    return this._mapCommentToViewType(newComment);
  }

  async updateCommentLikeStatus({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusArgs): Promise<boolean> {
    return await this.commentsRepository.updateCommentLikeStatusByCommentId({
      commentId,
      userId,
      likeStatus,
    });
  }

  async updateCommentById({
    id,
    content,
    userId,
  }: UpdateCommentArgs & { userId: string }): Promise<CommentManageStatuses> {
    const checkingResult = await this._checkCommentByOwnerId({
      commentId: id,
      userId,
    });
    if (checkingResult !== CommentManageStatuses.SUCCESS) return checkingResult;
    const updateResult = await this.commentsRepository.updateCommentById({
      id,
      content,
    });
    if (!updateResult) return CommentManageStatuses.NOT_FOUND;
    return CommentManageStatuses.SUCCESS;
  }

  async deleteCommentById({
    commentId,
    userId,
  }: DeleteCommentArgs): Promise<CommentManageStatuses> {
    const checkingResult = await this._checkCommentByOwnerId({
      commentId,
      userId,
    });
    if (checkingResult !== CommentManageStatuses.SUCCESS) return checkingResult;
    const updateResult =
      await this.commentsRepository.deleteCommentById(commentId);
    if (!updateResult) return CommentManageStatuses.NOT_FOUND;
    return CommentManageStatuses.SUCCESS;
  }

  async _checkCommentByOwnerId({
    commentId,
    userId,
  }: DeleteCommentArgs): Promise<CommentManageStatuses> {
    const foundComment =
      await this.commentsQueryRepository.getCommentById(commentId);
    if (!foundComment) return CommentManageStatuses.NOT_FOUND;
    if (foundComment.commentatorInfo.userId !== userId)
      return CommentManageStatuses.NOT_OWNER;
    return CommentManageStatuses.SUCCESS;
  }
}
