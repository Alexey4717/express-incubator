import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CommentManageStatuses } from '@/core/types/common';
import { LikeStatus } from '@/core/types/common';

import { PostsRepository } from '../../posts/repositories/CUD/posts-repository';
import { GetPostsInputModel } from '../models/GetPostCommentsInputModel';
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

type FindPostCommentsArgs = GetPostsInputModel & {
  currentUserId?: string;
};

@injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async findPostComments(query: FindPostCommentsArgs) {
    return await this.commentsQueryRepository.getPostComments(query);
  }

  async findById(id: string, currentUserId?: string) {
    return await this.commentsQueryRepository.getCommentById(id, currentUserId);
  }

  async createCommentInPost(input: CreateCommentInput): Promise<string | null> {
    const { postId, content, userId, userLogin } = input;
    const foundPost = await this.postsRepository.getPostById(postId);
    if (!foundPost) return null;

    const newComment = {
      _id: new ObjectId(),
      postId,
      content,
      commentatorInfo: { userId, userLogin },
      createdAt: new Date().toISOString(),
      reactions: [],
    };
    const commentId =
      await this.commentsRepository.createCommentInPost(newComment);
    return commentId?.toString() ?? null;
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
      await this.commentsRepository.getCommentById(commentId);
    if (!foundComment) return CommentManageStatuses.NOT_FOUND;
    if (foundComment.commentatorInfo.userId !== userId)
      return CommentManageStatuses.NOT_OWNER;
    return CommentManageStatuses.SUCCESS;
  }
}
