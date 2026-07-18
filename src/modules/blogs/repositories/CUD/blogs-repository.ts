import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import type { TPostDb } from '../../../posts/models/GetPostOutputModel';
import PostModel from '../../../posts/models/Post-model';
import BlogModel from '../../models/Blog-model';
import { GetBlogOutputModel, TBlogDb } from '../../models/GetBlogOutputModel';

type BlogUpdateDomain = Pick<
  GetBlogOutputModel,
  'name' | 'description' | 'websiteUrl'
>;

@injectable()
export class BlogsRepository {
  async getBlogById(id: string): Promise<TBlogDb | null> {
    try {
      const foundBlog = await BlogModel.findOne({
        _id: new ObjectId(id),
      }).lean();
      return foundBlog ?? null;
    } catch (error) {
      console.log(`BlogsRepository.getBlogById error is occurred: ${error}`);
      return null;
    }
  }

  async createBlog(newBlog: GetBlogOutputModel): Promise<ObjectId | null> {
    try {
      const result = await BlogModel.create(newBlog);
      return result._id ?? null;
    } catch (error) {
      console.log(`BlogsRepository.createBlog error is occurred: ${error}`);
      return null;
    }
  }

  async createPostInBlog(newPost: TPostDb): Promise<ObjectId | null> {
    try {
      const result = await PostModel.create(newPost);
      return result._id ?? null;
    } catch (error) {
      console.log(
        `BlogsRepository.createPostInBlog error is occurred: ${error}`,
      );
      return null;
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
