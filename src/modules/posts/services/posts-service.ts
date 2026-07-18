import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { LikeStatus } from '@/core/types/common';

import { BlogsRepository } from '../../blogs/repositories/CUD/blogs-repository';
import { CreatePostInputModel } from '../models/CreatePostInputModel';
import { TPostDb } from '../models/GetPostOutputModel';
import type { GetPostsArgs } from '../models/GetPostsInputModel';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { PostsRepository } from '../repositories/CUD/posts-repository';
import { PostsQueryRepository } from '../repositories/Queries/posts-query-repository';

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
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async findMany(query: FindManyPostsArgs) {
    return await this.postsQueryRepository.getPosts(query);
  }

  async findById(id: string, currentUserId?: string) {
    return await this.postsQueryRepository.findPostById(id, currentUserId);
  }

  async createPost(input: CreatePostInputModel): Promise<string | null> {
    const { title, shortDescription, blogId, content } = input || {};

    const foundBlog = await this.blogsRepository.getBlogById(blogId);

    if (!foundBlog) return null;

    const newPost: TPostDb = {
      _id: new ObjectId(),
      title,
      shortDescription,
      blogId,
      blogName: foundBlog.name,
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    const postId = await this.postsRepository.createPost(newPost);
    return postId?.toString() ?? null;
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
    const postUpdate: PostUpdateDomain = {
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
      blogId: input.blogId,
    };
    return await this.postsRepository.updatePost(id, postUpdate);
  }

  async updatePostLikeStatus({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<boolean> {
    return await this.postsRepository.updatePostLikeStatus({
      postId,
      userId,
      userLogin,
      likeStatus,
    });
  }

  async deletePostById(id: string): Promise<boolean> {
    return await this.postsRepository.deletePostById(id);
  }
}
