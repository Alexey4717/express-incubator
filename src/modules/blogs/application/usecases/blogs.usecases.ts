import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

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

  async execute(command: CreateBlogCommand): Promise<string> {
    const blog = BlogEntity.create(command.input);
    const createdBlogId = await this.blogsRepository.createBlog(blog);
    if (!createdBlogId) {
      throw domainException(DomainExceptionCode.BadRequest, 'CreateBlogFailed');
    }
    return createdBlogId.toString();
  }
}

@injectable()
export class UpdateBlogUseCase {
  constructor(
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<null> {
    const blog = await this.blogsRepository.getBlogById(command.id);
    if (!blog) {
      throw domainException(DomainExceptionCode.NotFound, 'BlogNotFound');
    }

    blog.update({
      name: command.input.name,
      description: command.input.description,
      websiteUrl: command.input.websiteUrl,
    });

    const updated = await this.blogsRepository.save(blog);
    if (!updated) {
      throw domainException(DomainExceptionCode.NotFound, 'BlogNotFound');
    }
    return null;
  }
}

@injectable()
export class DeleteBlogUseCase {
  constructor(
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<null> {
    const deleted = await this.blogsRepository.deleteBlogById(command.id);
    if (!deleted) {
      throw domainException(DomainExceptionCode.NotFound, 'BlogNotFound');
    }
    return null;
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

  async execute(command: CreatePostInBlogCommand): Promise<string> {
    const foundBlog = await this.blogsRepository.getBlogById(command.blogId);
    if (!foundBlog) {
      throw domainException(DomainExceptionCode.NotFound, 'BlogNotFound');
    }

    const post = PostEntity.create(
      { ...command.input, blogId: command.blogId },
      foundBlog.name,
    );
    const postId = await this.postsRepository.createPost(post);
    if (!postId) {
      throw domainException(DomainExceptionCode.BadRequest, 'CreatePostFailed');
    }
    return postId.toString();
  }
}
