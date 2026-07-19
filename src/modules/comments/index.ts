export { default as CommentModel } from './models/Comment-model';
export type { CreateCommentInputModel } from './models/CreateCommentInputModel';
export type {
  SortPostCommentsBy,
  GetPostCommentsInputModel as GetPostCommentsQueryModel,
} from './models/GetPostCommentsInputModel';
export type {
  GetCommentOutputModel,
  GetMappedCommentOutputModel,
  LikesInfo,
  TCommentDb,
} from './models/GetCommentOutputModel';
export { CommentsRepository } from './repositories/CUD/comments-repository';
export { CommentsQueryRepository } from './repositories/Queries/comments-query-repository';
export type { ICommentsRepository } from './repositories/contracts/ICommentsRepository';
export type { ICommentsQueryRepository } from './repositories/contracts/ICommentsQueryRepository';
export { bindCommentsModule } from './comments.module';
export { COMMENTS_TYPES } from './comments.tokens';
export { CommentControllers } from './controllers/comment-controllers';
export { CreateCommentCommand } from './application/commands/create-comment.command';
export { GetCommentByIdQuery } from './application/queries/get-comment-by-id.query';
export { GetPostCommentsQuery } from './application/queries/get-post-comments.query';
export {
  mapToCommentListPaginatedOutput,
  mapToCommentOutput,
} from './helpers/map-to-comment-output';
export {
  commentsCommandRegistrations,
  commentsQueryRegistrations,
} from './application/cqrs.registrations';
export { COMMENTS_PATH, COMMENTS_ROUTES } from './constants/comments.paths';
export { createCommentsRouter } from './routes/comments.router';
export type { CommentsRouterDeps } from './routes/comments.router';
export { createCommentInputValidations } from './validations/createCommentInputValidations';
