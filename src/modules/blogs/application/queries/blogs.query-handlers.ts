import { inject, injectable } from 'inversify';

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
    return await this.blogsQueryRepository.findBlogById(query.id);
  }
}

@injectable()
export class GetPostsInBlogQueryHandler {
  constructor(
    @inject(BLOGS_TYPES.IBlogsQueryRepository)
    protected blogsQueryRepository: IBlogsQueryRepository,
  ) {}

  async execute(query: GetPostsInBlogQuery) {
    return await this.blogsQueryRepository.getPostsInBlog({
      ...query.args,
      blogId: query.blogId,
    });
  }
}
