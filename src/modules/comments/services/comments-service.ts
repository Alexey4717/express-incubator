import { inject, injectable } from 'inversify';

import { CORE_TYPES } from '@/core/core.tokens';
import { mapDomainError } from '@/core/domain/map-domain-error';
import type { ILikeStatusRepository } from '@/core/repositories/contracts/ILikeStatusRepository';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';
import { LikeStatus } from '@/core/types/common';

import { POSTS_TYPES } from '../../posts/posts.tokens';
import type { IPostsRepository } from '../../posts/repositories/contracts/IPostsRepository';
import { COMMENTS_TYPES } from '../comments.tokens';
import { CommentEntity } from '../domain/entities/comment.entity';
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

    const comment = CommentEntity.create({
      postId,
      content,
      userId,
      userLogin,
    });
    const commentId =
      await this.commentsRepository.createCommentInPost(comment);
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
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }

    await this.likeStatusRepository.upsertLike({
      parentId: commentId,
      parentType: 'comment',
      userId,
      likeStatus,
    });

    const counts = await this.likeStatusRepository.countByParent(commentId);
    comment.applyLikeCounts(counts);
    const updated = await this.commentsRepository.save(comment);
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
    const comment = await this.commentsRepository.getCommentById(id);
    if (!comment) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }

    try {
      comment.canBeModifiedBy(userId);
      comment.update(content);
    } catch (error) {
      return mapDomainError(error);
    }

    const updateResult = await this.commentsRepository.save(comment);
    if (!updateResult) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }
    return ok(null);
  }

  async deleteCommentById({
    commentId,
    userId,
  }: DeleteCommentArgs): Promise<Result<null>> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }

    try {
      comment.canBeModifiedBy(userId);
    } catch (error) {
      return mapDomainError(error);
    }

    const updateResult =
      await this.commentsRepository.deleteCommentById(commentId);
    if (!updateResult) {
      return fail(ResultStatus.NotFound, { reason: 'CommentNotFound' });
    }
    return ok(null);
  }
}
