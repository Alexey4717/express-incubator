import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import type { TPostDb } from '../../posts/models/GetPostOutputModel';
import { CreateBlogInputModel } from '../models/CreateBlogInputModel';
import { CreatePostInBlogInputAndQueryModel } from '../models/CreatePostInBlogInputModel';
import {
  GetBlogOutputModel,
  GetBlogOutputModelFromMongoDB,
} from '../models/GetBlogOutputModel';
import type { GetBlogsArgs } from '../models/GetBlogsInputModel';
import type { GetPostsInBlogArgs } from '../models/GetPostsInBlogArgs';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import { BlogsRepository } from '../repositories/CUD/blogs-repository';
import { BlogsQueryRepository } from '../repositories/Queries/blogs-query-repository';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogInputModel;
}

type BlogUpdateDomain = Pick<
  GetBlogOutputModel,
  'name' | 'description' | 'websiteUrl'
>;

@injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async findMany(query: GetBlogsArgs) {
    return await this.blogsQueryRepository.getBlogs(query);
  }

  async findById(id: string) {
    return await this.blogsQueryRepository.findBlogById(id);
  }

  async findPostsInBlog(blogId: string, query: GetPostsInBlogArgs) {
    return await this.blogsQueryRepository.getPostsInBlog({
      ...query,
      blogId,
    });
  }

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

    const result = await this.blogsRepository.createPostInBlog(newPost);
    if (!result) return null;
    return newPost;
  }

  async updateBlog({ id, input }: UpdateBlogArgs): Promise<boolean> {
    const blogUpdate: BlogUpdateDomain = {
      name: input.name,
      description: input.description,
      websiteUrl: input.websiteUrl,
    };
    return await this.blogsRepository.updateBlog(id, blogUpdate);
  }

  async deleteBlogById(id: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlogById(id);
  }
}
