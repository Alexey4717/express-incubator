import { Container } from 'inversify';

import { PostControllers } from './controllers/post-controllers';
import { POSTS_TYPES } from './posts.tokens';
import { PostsRepository } from './repositories/CUD/posts-repository';
import { PostsQueryRepository } from './repositories/Queries/posts-query-repository';
import { PostsService } from './services/posts-service';

export const bindPostsModule = (container: Container): void => {
  container.bind(POSTS_TYPES.IPostsRepository).to(PostsRepository);
  container.bind(POSTS_TYPES.IPostsQueryRepository).to(PostsQueryRepository);
  container.bind(PostsService).toSelf();
  container.bind(PostControllers).toSelf();
};
