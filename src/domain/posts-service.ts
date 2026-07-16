import { ObjectId } from 'mongodb';

import { CreatePostInputModel } from '../models/PostModels/CreatePostInputModel';
import {
  GetMappedPostOutputModel,
  GetPostOutputModelFromMongoDB,
  TPostDb,
} from '../models/PostModels/GetPostOutputModel';
import PostModel from '../models/PostModels/Post-model';
import { UpdatePostInputModel } from '../models/PostModels/UpdatePostInputModel';
import { postsRepository } from '../repositories/CUD-repo/posts-repository';
import { blogsQueryRepository } from '../repositories/Queries-repo/blogs-query-repository';
import { LikeStatus } from '../types/common';

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

export const postsService = {
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
  },

  async createPost(
    input: CreatePostInputModel,
  ): Promise<GetMappedPostOutputModel | null> {
    const { title, shortDescription, blogId, content } = input || {};

    const foundBlog = await blogsQueryRepository.findBlogById(blogId);

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

    const postFromDB = await postsRepository.createPost(newPost);
    if (!postFromDB) return null;
    return this._mapPostToViewType(postFromDB);
  },

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
    return await postsRepository.updatePost({ id, input });
  },

  async updatePostLikeStatus({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<boolean> {
    return await postsRepository.updatePostLikeStatus({
      postId,
      userId,
      userLogin,
      likeStatus,
    });
  },

  async deletePostById(id: string): Promise<boolean> {
    return await postsRepository.deletePostById(id);
  },
};
