import { CreateCommentCommand } from './commands/create-comment.command';
import { DeleteCommentCommand } from './commands/delete-comment.command';
import { UpdateCommentLikeStatusCommand } from './commands/update-comment-like-status.command';
import { UpdateCommentCommand } from './commands/update-comment.command';
import {
  GetCommentByIdQueryHandler,
  GetPostCommentsQueryHandler,
} from './queries/comments.query-handlers';
import { GetCommentByIdQuery } from './queries/get-comment-by-id.query';
import { GetPostCommentsQuery } from './queries/get-post-comments.query';
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  UpdateCommentUseCase,
} from './usecases/comments.usecases';

export const commentsCommandRegistrations = [
  { command: CreateCommentCommand, handler: CreateCommentUseCase },
  { command: UpdateCommentCommand, handler: UpdateCommentUseCase },
  {
    command: UpdateCommentLikeStatusCommand,
    handler: UpdateCommentLikeStatusUseCase,
  },
  { command: DeleteCommentCommand, handler: DeleteCommentUseCase },
] as const;

export const commentsQueryRegistrations = [
  { query: GetPostCommentsQuery, handler: GetPostCommentsQueryHandler },
  { query: GetCommentByIdQuery, handler: GetCommentByIdQueryHandler },
] as const;
