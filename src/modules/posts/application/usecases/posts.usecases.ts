import { inject, injectable } from 'inversify';

import { CORE_TYPES } from '@/core/core.tokens';
import type { ILikeStatusRepository } from '@/core/repositories/contracts/ILikeStatusRepository';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

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

  async execute(command: CreatePostCommand): Promise<Result<string>> {
    const foundBlog = await this.blogsRepository.getBlogById(
      command.input.blogId,
    );
    if (!foundBlog) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    const post = PostEntity.create(command.input, foundBlog.name);
    const postId = await this.postsRepository.createPost(post);
    if (!postId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreatePostFailed' });
    }
    return ok(postId.toString());
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

  async execute(command: UpdatePostCommand): Promise<Result<null>> {
    const foundBlog = await this.blogsRepository.getBlogById(
      command.input.blogId,
    );
    if (!foundBlog) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    const post = await this.postsRepository.getPostById(command.id);
    if (!post) {
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
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
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
    }
    return ok(null);
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

  async execute(command: UpdatePostLikeStatusCommand): Promise<Result<null>> {
    const post = await this.postsRepository.getPostById(command.postId);
    if (!post) {
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
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
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
    }
    return ok(null);
  }
}

@injectable()
export class DeletePostUseCase {
  constructor(
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<Result<null>> {
    const deleted = await this.postsRepository.deletePostById(command.id);
    if (!deleted) {
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
    }
    return ok(null);
  }
}
