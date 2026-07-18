import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { PostEntity } from '../../domain/entities/post.entity';
import PostModel from '../../models/Post-model';
import type { IPostsRepository } from '../contracts/IPostsRepository';

@injectable()
export class PostsRepository implements IPostsRepository {
  async getPostById(id: string): Promise<PostEntity | null> {
    try {
      const foundPost = await PostModel.findOne({
        _id: new ObjectId(id),
      }).lean();
      return foundPost ? PostEntity.reconstitute(foundPost) : null;
    } catch (error) {
      console.log(`PostsRepository.getPostById error is occurred: ${error}`);
      return null;
    }
  }

  async createPost(post: PostEntity): Promise<ObjectId | null> {
    try {
      const data = post.toDb();
      const result = await PostModel.create(data);
      return result._id ?? null;
    } catch (error) {
      console.log(`PostsRepository.createPost error is occurred: ${error}`);
      return null;
    }
  }

  async save(post: PostEntity): Promise<boolean> {
    try {
      const data = post.toDb();
      const response = await PostModel.updateOne(
        { _id: data._id },
        {
          $set: {
            title: data.title,
            shortDescription: data.shortDescription,
            content: data.content,
            blogId: data.blogId,
            blogName: data.blogName,
            likesCount: data.likesCount,
            dislikesCount: data.dislikesCount,
          },
        },
      );
      return response.matchedCount === 1;
    } catch (error) {
      console.log(`PostsRepository.save error is occurred: ${error}`);
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
