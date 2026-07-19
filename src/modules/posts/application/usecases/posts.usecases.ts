import { inject, injectable } from 'inversify';

import { CORE_TYPES } from '@/core/core.tokens';
import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';
import type { ILikeStatusRepository } from '@/core/repositories/contracts/ILikeStatusRepository';

import { BLOGS_TYPES } from '../../../blogs/blogs.tokens';
import type { IBlogsRepository } from '../../../blogs/repositories/contracts/IBlogsRepository';
import { PostEntity } from '../../domain/entities/post.entity';
import { POSTS_TYPES } from '../../posts.tokens';
import type { IPostsRepository } from '../../repositories/contracts/IPostsRepository';
import { CreatePostCommand } from '../commands/create-post.command';
import { DeletePostCommand } from '../commands/delete-post.command';
import { UpdatePostLikeStatusCommand } from '../commands/update-post-like-status.command';
import { UpdatePostCommand } from '../commands/update-post.command';

@injectable()
export class CreatePostUseCase {
  constructor(
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const foundBlog = await this.blogsRepository.getBlogById(
      command.input.blogId,
    );
    if (!foundBlog) {
      throw domainException(DomainExceptionCode.NotFound, 'BlogNotFound');
    }

    const post = PostEntity.create(command.input, foundBlog.name);
    const postId = await this.postsRepository.createPost(post);
    if (!postId) {
      throw domainException(DomainExceptionCode.BadRequest, 'CreatePostFailed');
    }
    return postId.toString();
  }
}

@injectable()
export class UpdatePostUseCase {
  constructor(
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<null> {
    const foundBlog = await this.blogsRepository.getBlogById(
      command.input.blogId,
    );
    if (!foundBlog) {
      throw domainException(DomainExceptionCode.NotFound, 'BlogNotFound');
    }

    const post = await this.postsRepository.getPostById(command.id);
    if (!post) {
      throw domainException(DomainExceptionCode.NotFound, 'PostNotFound');
    }

    post.update(
      {
        title: command.input.title,
        shortDescription: command.input.shortDescription,
        content: command.input.content,
        blogId: command.input.blogId,
      },
      foundBlog.name,
    );

    const updated = await this.postsRepository.save(post);
    if (!updated) {
      throw domainException(DomainExceptionCode.NotFound, 'PostNotFound');
    }
    return null;
  }
}

@injectable()
export class UpdatePostLikeStatusUseCase {
  constructor(
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
    @inject(CORE_TYPES.ILikeStatusRepository)
    protected likeStatusRepository: ILikeStatusRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<null> {
    const post = await this.postsRepository.getPostById(command.postId);
    if (!post) {
      throw domainException(DomainExceptionCode.NotFound, 'PostNotFound');
    }

    await this.likeStatusRepository.upsertLike({
      parentId: command.postId,
      parentType: 'post',
      userId: command.userId,
      userLogin: command.userLogin,
      likeStatus: command.likeStatus,
    });

    const counts = await this.likeStatusRepository.countByParent(
      command.postId,
    );
    post.applyLikeCounts(counts);
    const updated = await this.postsRepository.save(post);
    if (!updated) {
      throw domainException(DomainExceptionCode.NotFound, 'PostNotFound');
    }
    return null;
  }
}

@injectable()
export class DeletePostUseCase {
  constructor(
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<null> {
    const deleted = await this.postsRepository.deletePostById(command.id);
    if (!deleted) {
      throw domainException(DomainExceptionCode.NotFound, 'PostNotFound');
    }
    return null;
  }
}
