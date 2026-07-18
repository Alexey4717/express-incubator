import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { LikeStatus } from '@/core/types/common';

import { TPostDb } from '../../models/GetPostOutputModel';
import { TReactions } from '../../models/GetPostOutputModel';
import PostModel from '../../models/Post-model';
import type { IPostsRepository } from '../contracts/IPostsRepository';

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
export class PostsRepository implements IPostsRepository {
  async getPostById(id: string): Promise<TPostDb | null> {
    try {
      const foundPost = await PostModel.findOne({
        _id: new ObjectId(id),
      }).lean();
      return foundPost ?? null;
    } catch (error) {
      console.log(`PostsRepository.getPostById error is occurred: ${error}`);
      return null;
    }
  }

  async createPost(newPost: TPostDb): Promise<ObjectId | null> {
    try {
      const result = await PostModel.create(newPost);
      return result._id ?? null;
    } catch (error) {
      console.log(`PostsRepository.createPost error is occurred: ${error}`);
      return null;
    }
  }

  async updatePost(id: string, post: PostUpdateDomain): Promise<boolean> {
    try {
      const response = await PostModel.updateOne(
        { _id: new ObjectId(id) },
        { $set: post },
      );
      return response.matchedCount === 1;
    } catch (error) {
      console.log(`PostsRepository.updatePost error is occurred: ${error}`);
      return false;
    }
  }

  async updatePostLikeStatus({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<boolean> {
    try {
      const filter = { _id: new ObjectId(postId) };
      const foundPost = await this.getPostById(postId);

      if (!foundPost) return false;

      const foundPostLikeStatus = foundPost.reactions.find(
        (likeStatus: TReactions) => likeStatus.userId === userId,
      );

      if (!foundPostLikeStatus) {
        const newPostLikeStatus: TReactions = {
          userId,
          userLogin,
          likeStatus,
          createdAt: new Date().toISOString(),
        };

        const result = await PostModel.updateOne(filter, {
          $push: { reactions: newPostLikeStatus },
        });
        return result.matchedCount === 1;
      }

      if (foundPostLikeStatus.likeStatus === likeStatus) return true;

      const result = await PostModel.updateOne(
        { ...filter, 'reactions.userId': userId },
        {
          $set: {
            'reactions.$.likeStatus': likeStatus,
            'reactions.$.createdAt': new Date().toISOString(),
          },
        },
      );

      return result.matchedCount === 1;
    } catch (error) {
      console.log(
        'PostsRepository.updatePostLikeStatus error is occurred: ',
        error,
      );
      return false;
    }
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await PostModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`PostsRepository.deletePostById error is occurred: ${error}`);
      return false;
    }
  }
}
