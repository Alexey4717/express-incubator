import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import { POSTS_TYPES } from '../../posts.tokens';
import type { IPostsQueryRepository } from '../../repositories/contracts/IPostsQueryRepository';
import { GetPostByIdQuery } from './get-post-by-id.query';
import { GetPostsQuery } from './get-posts.query';

@injectable()
export class GetPostsQueryHandler {
  constructor(
    @inject(POSTS_TYPES.IPostsQueryRepository)
    protected postsQueryRepository: IPostsQueryRepository,
  ) {}

  async execute(query: GetPostsQuery) {
    return await this.postsQueryRepository.getPosts(query.args);
  }
}

@injectable()
export class GetPostByIdQueryHandler {
  constructor(
    @inject(POSTS_TYPES.IPostsQueryRepository)
    protected postsQueryRepository: IPostsQueryRepository,
  ) {}

  async execute(query: GetPostByIdQuery) {
    const post = await this.postsQueryRepository.findPostById(
      query.id,
      query.currentUserId,
    );
    if (!post) {
      throw domainException(DomainExceptionCode.NotFound, 'PostNotFound');
    }
    return post;
  }
}
