import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import BlogModel from '../../../blogs/models/BlogModels/Blog-model';
import { GetBlogOutputModel } from '../../../blogs/models/BlogModels/GetBlogOutputModel';
import { GetBlogOutputModelFromMongoDB } from '../../../blogs/models/BlogModels/GetBlogOutputModel';
import { UpdateBlogInputModel } from '../../../blogs/models/BlogModels/UpdateBlogInputModel';
import { TPostDb } from '../../../posts/models/PostModels/GetPostOutputModel';
import PostModel from '../../../posts/models/PostModels/Post-model';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogInputModel;
}

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

  async updateBlog({ id, input }: UpdateBlogArgs): Promise<boolean> {
    try {
      const result = await BlogModel.updateOne(
        { _id: new ObjectId(id) },
        { $set: input },
      );
      return result?.matchedCount === 1;
      // смотрим matchedCount, а не modifiedCount, т.к. при полном соответствии
      // данных mongo не производит операцию обновления и не вернет ничего
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
