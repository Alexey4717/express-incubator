import { inject, injectable } from 'inversify';

import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import { PostEntity } from '../../../posts/domain/entities/post.entity';
import { POSTS_TYPES } from '../../../posts/posts.tokens';
import type { IPostsRepository } from '../../../posts/repositories/contracts/IPostsRepository';
import { BLOGS_TYPES } from '../../blogs.tokens';
import { BlogEntity } from '../../domain/entities/blog.entity';
import type { IBlogsRepository } from '../../repositories/contracts/IBlogsRepository';
import { CreateBlogCommand } from '../commands/create-blog.command';
import { CreatePostInBlogCommand } from '../commands/create-post-in-blog.command';
import { DeleteBlogCommand } from '../commands/delete-blog.command';
import { UpdateBlogCommand } from '../commands/update-blog.command';

@injectable()
export class CreateBlogUseCase {
  constructor(
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Result<string>> {
    const blog = BlogEntity.create(command.input);
    const createdBlogId = await this.blogsRepository.createBlog(blog);
    if (!createdBlogId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateBlogFailed' });
    }
    return ok(createdBlogId.toString());
  }
}

@injectable()
export class UpdateBlogUseCase {
  constructor(
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<Result<null>> {
    const blog = await this.blogsRepository.getBlogById(command.id);
    if (!blog) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    blog.update({
      name: command.input.name,
      description: command.input.description,
      websiteUrl: command.input.websiteUrl,
    });

    const updated = await this.blogsRepository.save(blog);
    if (!updated) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }
    return ok(null);
  }
}

@injectable()
export class DeleteBlogUseCase {
  constructor(
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<Result<null>> {
    const deleted = await this.blogsRepository.deleteBlogById(command.id);
    if (!deleted) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }
    return ok(null);
  }
}

@injectable()
export class CreatePostInBlogUseCase {
  constructor(
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
  ) {}

  async execute(command: CreatePostInBlogCommand): Promise<Result<string>> {
    const foundBlog = await this.blogsRepository.getBlogById(command.blogId);
    if (!foundBlog) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    const post = PostEntity.create(
      { ...command.input, blogId: command.blogId },
      foundBlog.name,
    );
    const postId = await this.postsRepository.createPost(post);
    if (!postId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreatePostFailed' });
    }
    return ok(postId.toString());
  }
}
