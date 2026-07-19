import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import { COMMENTS_TYPES } from '../../comments.tokens';
import type { ICommentsQueryRepository } from '../../repositories/contracts/ICommentsQueryRepository';
import { GetCommentByIdQuery } from './get-comment-by-id.query';
import { GetPostCommentsQuery } from './get-post-comments.query';

@injectable()
export class GetPostCommentsQueryHandler {
  constructor(
    @inject(COMMENTS_TYPES.ICommentsQueryRepository)
    protected commentsQueryRepository: ICommentsQueryRepository,
  ) {}

  async execute(query: GetPostCommentsQuery) {
    const result = await this.commentsQueryRepository.getPostComments(
      query.args,
    );
    if (!result) {
      throw domainException(DomainExceptionCode.NotFound, 'PostNotFound');
    }
    return result;
  }
}

@injectable()
export class GetCommentByIdQueryHandler {
  constructor(
    @inject(COMMENTS_TYPES.ICommentsQueryRepository)
    protected commentsQueryRepository: ICommentsQueryRepository,
  ) {}

  async execute(query: GetCommentByIdQuery) {
    const comment = await this.commentsQueryRepository.getCommentById(
      query.id,
      query.currentUserId,
    );
    if (!comment) {
      throw domainException(DomainExceptionCode.NotFound, 'CommentNotFound');
    }
    return comment;
  }
}
