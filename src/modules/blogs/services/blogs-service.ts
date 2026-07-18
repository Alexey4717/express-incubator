import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import type { TPostDb } from '../../posts/models/GetPostOutputModel';
import { BLOGS_TYPES } from '../blogs.tokens';
import { CreateBlogInputModel } from '../models/CreateBlogInputModel';
import { CreatePostInBlogInputAndQueryModel } from '../models/CreatePostInBlogInputModel';
import { GetBlogOutputModel } from '../models/GetBlogOutputModel';
import type { GetBlogsArgs } from '../models/GetBlogsInputModel';
import type { GetPostsInBlogArgs } from '../models/GetPostsInBlogArgs';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import type { IBlogsQueryRepository } from '../repositories/contracts/IBlogsQueryRepository';
import type { IBlogsRepository } from '../repositories/contracts/IBlogsRepository';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogInputModel;
}

type BlogUpdateDomain = Pick<
  GetBlogOutputModel,
  'name' | 'description' | 'websiteUrl'
>;

type FindPostsInBlogArgs = GetPostsInBlogArgs & {
  currentUserId?: string;
};

@injectable()
export class BlogsService {
  constructor(
    @inject(BLOGS_TYPES.IBlogsRepository)
    protected blogsRepository: IBlogsRepository,
    @inject(BLOGS_TYPES.IBlogsQueryRepository)
    protected blogsQueryRepository: IBlogsQueryRepository,
  ) {}

  async findMany(query: GetBlogsArgs) {
    return await this.blogsQueryRepository.getBlogs(query);
  }

  async findById(id: string) {
    return await this.blogsQueryRepository.findBlogById(id);
  }

  async findPostsInBlog(blogId: string, query: FindPostsInBlogArgs) {
    return await this.blogsQueryRepository.getPostsInBlog({
      ...query,
      blogId,
    });
  }

  async createBlog(input: CreateBlogInputModel): Promise<Result<string>> {
    const { name, websiteUrl, description } = input || {};

    const newBlog = {
      name,
      websiteUrl,
      description,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    const createdBlogId = await this.blogsRepository.createBlog(newBlog);
    if (!createdBlogId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateBlogFailed' });
    }
    return ok(createdBlogId.toString());
  }

  async createPostInBlog({
    blogId,
    input,
  }: CreatePostInBlogInputAndQueryModel): Promise<Result<string>> {
    const { title, shortDescription, content } = input || {};

    const foundBlog = await this.blogsRepository.getBlogById(blogId);

    if (!foundBlog) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    const newPost: TPostDb = {
      _id: new ObjectId(),
      title,
      shortDescription,
      blogId,
      blogName: foundBlog.name,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    };

    const postId = await this.blogsRepository.createPostInBlog(newPost);
    if (!postId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreatePostFailed' });
    }
    return ok(postId.toString());
  }

  async updateBlog({ id, input }: UpdateBlogArgs): Promise<Result<null>> {
    const blogUpdate: BlogUpdateDomain = {
      name: input.name,
      description: input.description,
      websiteUrl: input.websiteUrl,
    };
    const updated = await this.blogsRepository.updateBlog(id, blogUpdate);
    if (!updated) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }
    return ok(null);
  }

  async deleteBlogById(id: string): Promise<Result<null>> {
    const deleted = await this.blogsRepository.deleteBlogById(id);
    if (!deleted) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }
    return ok(null);
  }
}
