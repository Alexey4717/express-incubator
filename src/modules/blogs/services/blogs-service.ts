import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CreateBlogInputModel } from '../../blogs/models/BlogModels/CreateBlogInputModel';
import { CreatePostInBlogInputAndQueryModel } from '../../blogs/models/BlogModels/CreatePostInBlogInputModel';
import { GetBlogOutputModelFromMongoDB } from '../../blogs/models/BlogModels/GetBlogOutputModel';
import { UpdateBlogInputModel } from '../../blogs/models/BlogModels/UpdateBlogInputModel';
import { BlogsQueryRepository } from '../../blogs/repositories/Queries/blogs-query-repository';
import {
  GetPostOutputModelFromMongoDB,
  TPostDb,
} from '../../posts/models/PostModels/GetPostOutputModel';
import { BlogsRepository } from '../repositories/CUD/blogs-repository';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogInputModel;
}

@injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async createBlog(
    input: CreateBlogInputModel,
  ): Promise<GetBlogOutputModelFromMongoDB> {
    const { name, websiteUrl, description } = input || {};

    const newBlog = {
      name,
      websiteUrl,
      description,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    const createdBlog = await this.blogsRepository.createBlog(newBlog);
    if (!createdBlog) {
      return {} as GetBlogOutputModelFromMongoDB;
    }
    return createdBlog;
  }

  async createPostInBlog({
    blogId,
    input,
  }: CreatePostInBlogInputAndQueryModel): Promise<TPostDb | null> {
    const { title, shortDescription, content } = input || {};

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

    await this.blogsRepository.createPostInBlog(newPost);
    return newPost as TPostDb;
  }

  async updateBlog({ id, input }: UpdateBlogArgs): Promise<boolean> {
    return await this.blogsRepository.updateBlog({ id, input });
  }

  async deleteBlogById(id: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlogById(id);
  }
}
