import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { LikeStatus } from '@/core/types/common';

import { BlogsQueryRepository } from '../../blogs/repositories/Queries/blogs-query-repository';
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

@injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async findMany(query: GetPostsArgs) {
    return await this.postsQueryRepository.getPosts(query);
  }

  async findById(id: string) {
    return await this.postsQueryRepository.findPostById(id);
  }

  async createPost(input: CreatePostInputModel): Promise<TPostDb | null> {
    const { title, shortDescription, blogId, content } = input || {};

    const foundBlog = await this.blogsQueryRepository.findBlogById(blogId);

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

    return await this.postsRepository.createPost(newPost);
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
