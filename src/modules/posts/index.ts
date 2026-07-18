export { default as PostModel } from './models/Post-model';
export type { CreatePostInputModel } from './models/CreatePostInputModel';
export type {
  SortPostsBy,
  GetPostsInputModel,
  GetPostsArgs,
} from './models/GetPostsInputModel';
export type {
  GetPostOutputModel,
  GetMappedPostOutputModel,
  TPostDb,
  ExtendedLikesInfo,
  NewestLikeType,
} from './models/GetPostOutputModel';
export { PostsRepository } from './repositories/CUD/posts-repository';
export { PostsQueryRepository } from './repositories/Queries/posts-query-repository';
export type { IPostsRepository } from './repositories/contracts/IPostsRepository';
export type { IPostsQueryRepository } from './repositories/contracts/IPostsQueryRepository';
export { bindPostsModule } from './posts.module';
export { POSTS_TYPES } from './posts.tokens';
export { PostsService } from './services/posts-service';
export { PostControllers } from './controllers/post-controllers';
export { POSTS_PATH, POSTS_ROUTES } from './constants/posts.paths';
export { createPostsRouter } from './routes/posts.router';
export type { PostsRouterDeps } from './routes/posts.router';
export {
  createPostValidations,
  type PostValidators,
  type PostValidations,
} from './validations/post-shared-validators';
