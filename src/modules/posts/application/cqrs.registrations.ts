import { CreatePostCommand } from './commands/create-post.command';
import { DeletePostCommand } from './commands/delete-post.command';
import { UpdatePostLikeStatusCommand } from './commands/update-post-like-status.command';
import { UpdatePostCommand } from './commands/update-post.command';
import { GetPostByIdQuery } from './queries/get-post-by-id.query';
import { GetPostsQuery } from './queries/get-posts.query';
import {
  GetPostByIdQueryHandler,
  GetPostsQueryHandler,
} from './queries/posts.query-handlers';
import {
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostLikeStatusUseCase,
  UpdatePostUseCase,
} from './usecases/posts.usecases';

export const postsCommandRegistrations = [
  { command: CreatePostCommand, handler: CreatePostUseCase },
  { command: UpdatePostCommand, handler: UpdatePostUseCase },
  {
    command: UpdatePostLikeStatusCommand,
    handler: UpdatePostLikeStatusUseCase,
  },
  { command: DeletePostCommand, handler: DeletePostUseCase },
] as const;

export const postsQueryRegistrations = [
  { query: GetPostsQuery, handler: GetPostsQueryHandler },
  { query: GetPostByIdQuery, handler: GetPostByIdQueryHandler },
] as const;
