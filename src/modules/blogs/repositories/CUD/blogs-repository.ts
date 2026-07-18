import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { BlogEntity } from '../../domain/entities/blog.entity';
import BlogModel from '../../models/Blog-model';
import { TBlogDb } from '../../models/GetBlogOutputModel';
import type { IBlogsRepository } from '../contracts/IBlogsRepository';

@injectable()
export class BlogsRepository implements IBlogsRepository {
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

  async createBlog(blog: BlogEntity): Promise<ObjectId | null> {
    try {
      const data = blog.toDb();
      const result = await BlogModel.create(data);
      return result._id ?? null;
    } catch (error) {
      console.log(`BlogsRepository.createBlog error is occurred: ${error}`);
      return null;
    }
  }

  async save(blog: BlogEntity): Promise<boolean> {
    try {
      const data = blog.toDb();
      const result = await BlogModel.updateOne(
        { _id: data._id },
        {
          $set: {
            name: data.name,
            description: data.description,
            websiteUrl: data.websiteUrl,
          },
        },
      );
      return result?.matchedCount === 1;
    } catch (error) {
      console.log(`BlogsRepository.save error is occurred: ${error}`);
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
