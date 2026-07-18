import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CORE_TYPES } from '@/core/core.tokens';
import type { ILikeStatusRepository } from '@/core/repositories/contracts/ILikeStatusRepository';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';
import { LikeStatus } from '@/core/types/common';

import { POSTS_TYPES } from '../../posts/posts.tokens';
import type { IPostsRepository } from '../../posts/repositories/contracts/IPostsRepository';
import { COMMENTS_TYPES } from '../comments.tokens';
import { GetPostsInputModel } from '../models/GetPostCommentsInputModel';
import type { ICommentsQueryRepository } from '../repositories/contracts/ICommentsQueryRepository';
import type { ICommentsRepository } from '../repositories/contracts/ICommentsRepository';

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
    @inject(COMMENTS_TYPES.ICommentsRepository)
    protected commentsRepository: ICommentsRepository,
    @inject(COMMENTS_TYPES.ICommentsQueryRepository)
    protected commentsQueryRepository: ICommentsQueryRepository,
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
    @inject(CORE_TYPES.ILikeStatusRepository)
    protected likeStatusRepository: ILikeStatusRepository,
  ) {}

  async findPostComments(query: FindPostCommentsArgs) {
    return await this.commentsQueryRepository.getPostComments(query);
  }

  async findById(id: string, currentUserId?: string) {
    return await this.commentsQueryRepository.getCommentById(id, currentUserId);
  }

  async createCommentInPost(
    input: CreateCommentInput,
  ): Promise<Result<string>> {
    const { postId, content, userId, userLogin } = input;
    const foundPost = await this.postsRepository.getPostById(postId);
    if (!foundPost) {
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
    }

    const newComment = {
      _id: new ObjectId(),
      postId,
      content,
      commentatorInfo: { userId, userLogin },
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    };
    const commentId =
      await this.commentsRepository.createCommentInPost(newComment);
    if (!commentId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateCommentFailed' });
    }
    return ok(commentId.toString());
  }

  async updateCommentLikeStatus({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusArgs): Promise<Result<null>> {
    const foundComment =
      await this.commentsRepository.getCommentById(commentId);
    if (!foundComment) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }

    await this.likeStatusRepository.upsertLike({
      parentId: commentId,
      parentType: 'comment',
      userId,
      likeStatus,
    });

    const counts = await this.likeStatusRepository.countByParent(commentId);
    const updated = await this.commentsRepository.updateLikeCounts(
      commentId,
      counts,
    );
    if (!updated) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }
    return ok(null);
  }

  async updateCommentById({
    id,
    content,
    userId,
  }: UpdateCommentArgs & { userId: string }): Promise<Result<null>> {
    const checkingResult = await this._checkCommentByOwnerId({
      commentId: id,
      userId,
    });
    if (checkingResult.status !== ResultStatus.Success) {
      return checkingResult;
    }

    const updateResult = await this.commentsRepository.updateCommentById({
      id,
      content,
    });
    if (!updateResult) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }
    return ok(null);
  }

  async deleteCommentById({
    commentId,
    userId,
  }: DeleteCommentArgs): Promise<Result<null>> {
    const checkingResult = await this._checkCommentByOwnerId({
      commentId,
      userId,
    });
    if (checkingResult.status !== ResultStatus.Success) {
      return checkingResult;
    }

    const updateResult =
      await this.commentsRepository.deleteCommentById(commentId);
    if (!updateResult) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }
    return ok(null);
  }

  async _checkCommentByOwnerId({
    commentId,
    userId,
  }: DeleteCommentArgs): Promise<Result<null>> {
    const foundComment =
      await this.commentsRepository.getCommentById(commentId);
    if (!foundComment) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }
    if (foundComment.commentatorInfo.userId !== userId) {
      return fail(ResultStatus.Forbidden, { reason: 'NotOwner' });
    }
    return ok(null);
  }
}
