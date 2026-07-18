import { inject, injectable } from 'inversify';

import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import { PostEntity } from '../../posts/domain/entities/post.entity';
import { POSTS_TYPES } from '../../posts/posts.tokens';
import type { IPostsRepository } from '../../posts/repositories/contracts/IPostsRepository';
import { BLOGS_TYPES } from '../blogs.tokens';
import { BlogEntity } from '../domain/entities/blog.entity';
import { CreateBlogInputModel } from '../models/CreateBlogInputModel';
import { CreatePostInBlogInputAndQueryModel } from '../models/CreatePostInBlogInputModel';
import type { GetBlogsArgs } from '../models/GetBlogsInputModel';
import type { GetPostsInBlogArgs } from '../models/GetPostsInBlogArgs';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import type { IBlogsQueryRepository } from '../repositories/contracts/IBlogsQueryRepository';
import type { IBlogsRepository } from '../repositories/contracts/IBlogsRepository';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogInputModel;
}

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
    @inject(POSTS_TYPES.IPostsRepository)
    protected postsRepository: IPostsRepository,
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
    const blog = BlogEntity.create(input);
    const createdBlogId = await this.blogsRepository.createBlog(blog);
    if (!createdBlogId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateBlogFailed' });
    }
    return ok(createdBlogId.toString());
  }

  async createPostInBlog({
    blogId,
    input,
  }: CreatePostInBlogInputAndQueryModel): Promise<Result<string>> {
    const foundBlog = await this.blogsRepository.getBlogById(blogId);
    if (!foundBlog) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    const post = PostEntity.create({ ...input, blogId }, foundBlog.name);
    const postId = await this.postsRepository.createPost(post);
    if (!postId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreatePostFailed' });
    }
    return ok(postId.toString());
  }

  async updateBlog({ id, input }: UpdateBlogArgs): Promise<Result<null>> {
    const blogRaw = await this.blogsRepository.getBlogById(id);
    if (!blogRaw) {
      return fail(ResultStatus.NotFound, { reason: 'BlogNotFound' });
    }

    const blog = BlogEntity.reconstitute(blogRaw);
    blog.update({
      name: input.name,
      description: input.description,
      websiteUrl: input.websiteUrl,
    });

    const updated = await this.blogsRepository.save(blog);
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
