import { Container } from 'inversify';

import {
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostsInBlogQueryHandler,
} from './application/queries/blogs.query-handlers';
import {
  CreateBlogUseCase,
  CreatePostInBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
} from './application/usecases/blogs.usecases';
import { BLOGS_TYPES } from './blogs.tokens';
import { BlogControllers } from './controllers/blog-controllers';
import { BlogsRepository } from './repositories/CUD/blogs-repository';
import { BlogsQueryRepository } from './repositories/Queries/blogs-query-repository';

export const bindBlogsModule = (container: Container): void => {
  container.bind(BLOGS_TYPES.IBlogsRepository).to(BlogsRepository);
  container.bind(BLOGS_TYPES.IBlogsQueryRepository).to(BlogsQueryRepository);

  container.bind(CreateBlogUseCase).toSelf();
  container.bind(UpdateBlogUseCase).toSelf();
  container.bind(DeleteBlogUseCase).toSelf();
  container.bind(CreatePostInBlogUseCase).toSelf();
  container.bind(GetBlogsQueryHandler).toSelf();
  container.bind(GetBlogByIdQueryHandler).toSelf();
  container.bind(GetPostsInBlogQueryHandler).toSelf();
  container.bind(BlogControllers).toSelf();
};
