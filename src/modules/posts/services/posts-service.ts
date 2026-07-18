import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CORE_TYPES } from '@/core/core.tokens';
import type { ILikeStatusRepository } from '@/core/repositories/contracts/ILikeStatusRepository';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';
import { LikeStatus } from '@/core/types/common';

import { BLOGS_TYPES } from '../../blogs/blogs.tokens';
import type { IBlogsRepository } from '../../blogs/repositories/contracts/IBlogsRepository';
import { CreatePostInputModel } from '../models/CreatePostInputModel';
import { TPostDb } from '../models/GetPostOutputModel';
import type { GetPostsArgs } from '../models/GetPostsInputModel';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { POSTS_TYPES } from '../posts.tokens';
import type { IPostsQueryRepository } from '../repositories/contracts/IPostsQueryRepository';
import type { IPostsRepository } from '../repositories/contracts/IPostsRepository';

interface UpdatePostArgs {
  id: string;
  input: UpdatePostInputModel;
}

interface UpdateLikeStatusPostArgs {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}

type PostUpdateDomain = Pick<
  TPostDb,
  'title' | 'shortDescription' | 'content' | 'blogId'
>;

type FindManyPostsArgs = GetPostsArgs & {
  currentUserId?: string;
};

@injectable()
export class PostsService {
  constructor(
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
    @inject(POSTS_TYPES.IPostsQueryRepository)
    protected postsQueryRepository: IPostsQueryRepository,
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
    @inject(CORE_TYPES.ILikeStatusRepository)
    protected likeStatusRepository: ILikeStatusRepository,
  ) {}

  async findMany(query: FindManyPostsArgs) {
    return await this.postsQueryRepository.getPosts(query);
  }

  async findById(id: string, currentUserId?: string) {
    return await this.postsQueryRepository.findPostById(id, currentUserId);
  }

  async createPost(input: CreatePostInputModel): Promise<Result<string>> {
    const { title, shortDescription, blogId, content } = input || {};

    const foundBlog = await this.blogsRepository.getBlogById(blogId);

    if (!foundBlog) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    const newPost: TPostDb = {
      _id: new ObjectId(),
      title,
      shortDescription,
      blogId,
      blogName: foundBlog.name,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    };

    const postId = await this.postsRepository.createPost(newPost);
    if (!postId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreatePostFailed' });
    }
    return ok(postId.toString());
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<Result<null>> {
    const foundBlog = await this.blogsRepository.getBlogById(input.blogId);
    if (!foundBlog) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    const postUpdate: PostUpdateDomain = {
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
      blogId: input.blogId,
    };
    const updated = await this.postsRepository.updatePost(id, postUpdate);
    if (!updated) {
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
    }
    return ok(null);
  }

  async updatePostLikeStatus({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<Result<null>> {
    const foundPost = await this.postsRepository.getPostById(postId);
    if (!foundPost) {
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
    }

    await this.likeStatusRepository.upsertLike({
      parentId: postId,
      parentType: 'post',
      userId,
      userLogin,
      likeStatus,
    });

    const counts = await this.likeStatusRepository.countByParent(postId);
    const updated = await this.postsRepository.updateLikeCounts(postId, counts);
    if (!updated) {
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
    }
    return ok(null);
  }

  async deletePostById(id: string): Promise<Result<null>> {
    const deleted = await this.postsRepository.deletePostById(id);
    if (!deleted) {
      return fail(ResultStatus.NotFound, { reason: 'PostNotFound' });
    }
    return ok(null);
  }
}
