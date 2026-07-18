import { CreateBlogCommand } from './commands/create-blog.command';
import { CreatePostInBlogCommand } from './commands/create-post-in-blog.command';
import { DeleteBlogCommand } from './commands/delete-blog.command';
import { UpdateBlogCommand } from './commands/update-blog.command';
import {
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostsInBlogQueryHandler,
} from './queries/blogs.query-handlers';
import { GetBlogByIdQuery } from './queries/get-blog-by-id.query';
import { GetBlogsQuery } from './queries/get-blogs.query';
import { GetPostsInBlogQuery } from './queries/get-posts-in-blog.query';
import {
  CreateBlogUseCase,
  CreatePostInBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
} from './usecases/blogs.usecases';

export const blogsCommandRegistrations = [
  { command: CreateBlogCommand, handler: CreateBlogUseCase },
  { command: UpdateBlogCommand, handler: UpdateBlogUseCase },
  { command: DeleteBlogCommand, handler: DeleteBlogUseCase },
  { command: CreatePostInBlogCommand, handler: CreatePostInBlogUseCase },
] as const;

export const blogsQueryRegistrations = [
  { query: GetBlogsQuery, handler: GetBlogsQueryHandler },
  { query: GetBlogByIdQuery, handler: GetBlogByIdQueryHandler },
  { query: GetPostsInBlogQuery, handler: GetPostsInBlogQueryHandler },
] as const;
