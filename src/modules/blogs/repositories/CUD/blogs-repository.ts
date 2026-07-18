import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import type { TPostDb } from '../../../posts/models/GetPostOutputModel';
import PostModel from '../../../posts/models/Post-model';
import BlogModel from '../../models/Blog-model';
import { GetBlogOutputModel } from '../../models/GetBlogOutputModel';
import { GetBlogOutputModelFromMongoDB } from '../../models/GetBlogOutputModel';

type BlogUpdateDomain = Pick<
  GetBlogOutputModel,
  'name' | 'description' | 'websiteUrl'
>;

@injectable()
export class BlogsRepository {
  async createBlog(
    newBlog: GetBlogOutputModel,
  ): Promise<GetBlogOutputModelFromMongoDB | null> {
    try {
      const result = await BlogModel.create(newBlog);
      if (!result._id) return null;
      return {
        ...newBlog,
        _id: result._id,
      };
    } catch (error) {
      console.log(`BlogsRepository.createBlog error is occurred: ${error}`);
      return null;
    }
  }

  async createPostInBlog(newPost: TPostDb): Promise<boolean> {
    try {
      await PostModel.create(newPost);
      return true;
    } catch (error) {
      console.log(
        `BlogsRepository.createPostInBlog error is occurred: ${error}`,
      );
      return false;
    }
  }

  async updateBlog(id: string, blog: BlogUpdateDomain): Promise<boolean> {
    try {
      const result = await BlogModel.updateOne(
        { _id: new ObjectId(id) },
        { $set: blog },
      );
      return result?.matchedCount === 1;
    } catch (error) {
      console.log(`BlogsRepository.updateBlog error is occurred: ${error}`);
      return false;
    }
  }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await BlogModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`BlogsRepository.deleteBlogById error is occurred: ${error}`);
      return false;
    }
  }
}
