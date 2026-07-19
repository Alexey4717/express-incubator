import { inject, injectable } from 'inversify';

import { CORE_TYPES } from '@/core/core.tokens';
import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';
import type { ILikeStatusRepository } from '@/core/repositories/contracts/ILikeStatusRepository';

import { POSTS_TYPES } from '../../../posts/posts.tokens';
import type { IPostsRepository } from '../../../posts/repositories/contracts/IPostsRepository';
import { COMMENTS_TYPES } from '../../comments.tokens';
import { CommentEntity } from '../../domain/entities/comment.entity';
import type { ICommentsRepository } from '../../repositories/contracts/ICommentsRepository';
import { CreateCommentCommand } from '../commands/create-comment.command';
import { DeleteCommentCommand } from '../commands/delete-comment.command';
import { UpdateCommentLikeStatusCommand } from '../commands/update-comment-like-status.command';
import { UpdateCommentCommand } from '../commands/update-comment.command';

@injectable()
export class CreateCommentUseCase {
  constructor(
    @inject(COMMENTS_TYPES.ICommentsRepository)
    protected commentsRepository: ICommentsRepository,
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const foundPost = await this.postsRepository.getPostById(command.postId);
    if (!foundPost) {
      throw domainException(DomainExceptionCode.NotFound, 'PostNotFound');
    }

    const comment = CommentEntity.create({
      postId: command.postId,
      content: command.content,
      userId: command.userId,
      userLogin: command.userLogin,
    });
    const commentId =
      await this.commentsRepository.createCommentInPost(comment);
    if (!commentId) {
      throw domainException(
        DomainExceptionCode.BadRequest,
        'CreateCommentFailed',
      );
    }
    return commentId.toString();
  }
}

@injectable()
export class UpdateCommentUseCase {
  constructor(
    @inject(COMMENTS_TYPES.ICommentsRepository)
    protected commentsRepository: ICommentsRepository,
  ) {}

  async execute(command: UpdateCommentCommand): Promise<null> {
    const comment = await this.commentsRepository.getCommentById(command.id);
    if (!comment) {
      throw domainException(DomainExceptionCode.NotFound, 'CommentNotFound');
    }

    comment.canBeModifiedBy(command.userId);
    comment.update(command.content);

    const updateResult = await this.commentsRepository.save(comment);
    if (!updateResult) {
      throw domainException(DomainExceptionCode.NotFound, 'CommentNotFound');
    }
    return null;
  }
}

@injectable()
export class UpdateCommentLikeStatusUseCase {
  constructor(
    @inject(COMMENTS_TYPES.ICommentsRepository)
    protected commentsRepository: ICommentsRepository,
    @inject(CORE_TYPES.ILikeStatusRepository)
    protected likeStatusRepository: ILikeStatusRepository,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand): Promise<null> {
    const comment = await this.commentsRepository.getCommentById(
      command.commentId,
    );
    if (!comment) {
      throw domainException(DomainExceptionCode.NotFound, 'CommentNotFound');
    }

    await this.likeStatusRepository.upsertLike({
      parentId: command.commentId,
      parentType: 'comment',
      userId: command.userId,
      likeStatus: command.likeStatus,
    });

    const counts = await this.likeStatusRepository.countByParent(
      command.commentId,
    );
    comment.applyLikeCounts(counts);
    const updated = await this.commentsRepository.save(comment);
    if (!updated) {
      throw domainException(DomainExceptionCode.NotFound, 'CommentNotFound');
    }
    return null;
  }
}

@injectable()
export class DeleteCommentUseCase {
  constructor(
    @inject(COMMENTS_TYPES.ICommentsRepository)
    protected commentsRepository: ICommentsRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<null> {
    const comment = await this.commentsRepository.getCommentById(
      command.commentId,
    );
    if (!comment) {
      throw domainException(DomainExceptionCode.NotFound, 'CommentNotFound');
    }

    comment.canBeModifiedBy(command.userId);

    const updateResult = await this.commentsRepository.deleteCommentById(
      command.commentId,
    );
    if (!updateResult) {
      throw domainException(DomainExceptionCode.NotFound, 'CommentNotFound');
    }
    return null;
  }
}
