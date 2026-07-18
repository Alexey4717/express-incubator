import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { TPostDb } from '../../models/GetPostOutputModel';
import PostModel from '../../models/Post-model';
import type { IPostsRepository } from '../contracts/IPostsRepository';

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

  async updateLikeCounts(
    postId: string,
    counts: { likesCount: number; dislikesCount: number },
  ): Promise<boolean> {
    try {
      const result = await PostModel.updateOne(
        { _id: new ObjectId(postId) },
        {
          $set: {
            likesCount: counts.likesCount,
            dislikesCount: counts.dislikesCount,
          },
        },
      );
      return result.matchedCount === 1;
    } catch (error) {
      console.log(
        `PostsRepository.updateLikeCounts error is occurred: ${error}`,
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
