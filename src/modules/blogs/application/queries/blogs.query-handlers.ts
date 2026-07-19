import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import { BLOGS_TYPES } from '../../blogs.tokens';
import type { IBlogsQueryRepository } from '../../repositories/contracts/IBlogsQueryRepository';
import { GetBlogByIdQuery } from './get-blog-by-id.query';
import { GetBlogsQuery } from './get-blogs.query';
import { GetPostsInBlogQuery } from './get-posts-in-blog.query';

@injectable()
export class GetBlogsQueryHandler {
  constructor(
    @inject(BLOGS_TYPES.IBlogsQueryRepository)
    protected blogsQueryRepository: IBlogsQueryRepository,
  ) {}

  async execute(query: GetBlogsQuery) {
    return await this.blogsQueryRepository.getBlogs(query.args);
  }
}

@injectable()
export class GetBlogByIdQueryHandler {
  constructor(
    @inject(BLOGS_TYPES.IBlogsQueryRepository)
    protected blogsQueryRepository: IBlogsQueryRepository,
  ) {}

  async execute(query: GetBlogByIdQuery) {
    const blog = await this.blogsQueryRepository.findBlogById(query.id);
    if (!blog) {
      throw domainException(DomainExceptionCode.NotFound, 'BlogNotFound');
    }
    return blog;
  }
}

@injectable()
export class GetPostsInBlogQueryHandler {
  constructor(
    @inject(BLOGS_TYPES.IBlogsQueryRepository)
    protected blogsQueryRepository: IBlogsQueryRepository,
  ) {}

  async execute(query: GetPostsInBlogQuery) {
    const result = await this.blogsQueryRepository.getPostsInBlog({
      ...query.args,
      blogId: query.blogId,
    });
    if (!result) {
      throw domainException(DomainExceptionCode.NotFound, 'BlogNotFound');
    }
    return result;
  }
}
