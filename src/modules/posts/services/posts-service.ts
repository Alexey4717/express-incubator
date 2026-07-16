import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { LikeStatus } from '@/core/types/common';

import { BlogsQueryRepository } from '../../blogs/repositories/Queries/blogs-query-repository';
import { CreatePostInputModel } from '../models/CreatePostInputModel';
import {
  GetMappedPostOutputModel,
  TPostDb,
} from '../models/GetPostOutputModel';
import PostModel from '../models/Post-model';
import { UpdatePostInputModel } from '../models/UpdatePostInputModel';
import { PostsRepository } from '../repositories/CUD/posts-repository';

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

@injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  _mapPostToViewType(post: TPostDb): GetMappedPostOutputModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }

  async createPost(
    input: CreatePostInputModel,
  ): Promise<GetMappedPostOutputModel | null> {
    const { title, shortDescription, blogId, content } = input || {};

    const foundBlog = await this.blogsQueryRepository.findBlogById(blogId);

    if (!foundBlog) return null;

    const newPost = await PostModel.create({
      _id: new ObjectId(),
      title,
      shortDescription,
      blogId,
      blogName: foundBlog.name,
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
    });

    const postFromDB = await this.postsRepository.createPost(newPost);
    if (!postFromDB) return null;
    return this._mapPostToViewType(postFromDB);
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
    return await this.postsRepository.updatePost({ id, input });
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
