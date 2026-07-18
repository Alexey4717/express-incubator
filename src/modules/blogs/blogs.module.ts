import { Container } from 'inversify';

import { BLOGS_TYPES } from './blogs.tokens';
import { BlogControllers } from './controllers/blog-controllers';
import { BlogsRepository } from './repositories/CUD/blogs-repository';
import { BlogsQueryRepository } from './repositories/Queries/blogs-query-repository';
import { BlogsService } from './services/blogs-service';

export const bindBlogsModule = (container: Container): void => {
  container.bind(BLOGS_TYPES.IBlogsRepository).to(BlogsRepository);
  container.bind(BLOGS_TYPES.IBlogsQueryRepository).to(BlogsQueryRepository);
  container.bind(BlogsService).toSelf();
  container.bind(BlogControllers).toSelf();
};
