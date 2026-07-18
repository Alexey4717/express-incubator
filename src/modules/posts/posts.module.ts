import { Container } from 'inversify';

import {
  GetPostByIdQueryHandler,
  GetPostsQueryHandler,
} from './application/queries/posts.query-handlers';
import {
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostLikeStatusUseCase,
  UpdatePostUseCase,
} from './application/usecases/posts.usecases';
import { PostControllers } from './controllers/post-controllers';
import { POSTS_TYPES } from './posts.tokens';
import { PostsRepository } from './repositories/CUD/posts-repository';
import { PostsQueryRepository } from './repositories/Queries/posts-query-repository';

export const bindPostsModule = (container: Container): void => {
  container.bind(POSTS_TYPES.IPostsRepository).to(PostsRepository);
  container.bind(POSTS_TYPES.IPostsQueryRepository).to(PostsQueryRepository);

  container.bind(CreatePostUseCase).toSelf();
  container.bind(UpdatePostUseCase).toSelf();
  container.bind(UpdatePostLikeStatusUseCase).toSelf();
  container.bind(DeletePostUseCase).toSelf();
  container.bind(GetPostsQueryHandler).toSelf();
  container.bind(GetPostByIdQueryHandler).toSelf();
  container.bind(PostControllers).toSelf();
};
