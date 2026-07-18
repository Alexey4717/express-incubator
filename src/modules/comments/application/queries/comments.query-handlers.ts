import { inject, injectable } from 'inversify';

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
    return await this.commentsQueryRepository.getPostComments(query.args);
  }
}

@injectable()
export class GetCommentByIdQueryHandler {
  constructor(
    @inject(COMMENTS_TYPES.ICommentsQueryRepository)
    protected commentsQueryRepository: ICommentsQueryRepository,
  ) {}

  async execute(query: GetCommentByIdQuery) {
    return await this.commentsQueryRepository.getCommentById(
      query.id,
      query.currentUserId,
    );
  }
}
