import 'reflect-metadata';

import { JwtService } from '../core/application/jwt-service';
import { AuthControllers } from '../modules/auth/controllers/auth-controllers';
import { BlogControllers } from '../modules/blogs/controllers/blog-controllers';
import { BlogsQueryRepository } from '../modules/blogs/repositories/Queries/blogs-query-repository';
import { CommentControllers } from '../modules/comments/controllers/comment-controllers';
import { CommentsQueryRepository } from '../modules/comments/repositories/Queries/comments-query-repository';
import { PostControllers } from '../modules/posts/controllers/post-controllers';
import { PostsQueryRepository } from '../modules/posts/repositories/Queries/posts-query-repository';
import { SecurityDeviceControllers } from '../modules/security-devices/controllers/security-device-controllers';
import { SecurityDevicesQueryRepository } from '../modules/security-devices/repositories/Queries/security-devices-query-repository';
import { TestingControllers } from '../modules/testing/controllers/testing-controllers';
import { UserControllers } from '../modules/users/controllers/user-controllers';
import { UsersRepository } from '../modules/users/repositories/CUD/users-repository';
import { UsersQueryRepository } from '../modules/users/repositories/Queries/users-query-repository';
import { VideoControllers } from '../modules/videos/controllers/video-controllers';
import { container } from './ioc/container';

export const blogControllers = container.get(BlogControllers);
export const postControllers = container.get(PostControllers);
export const commentControllers = container.get(CommentControllers);
export const videoControllers = container.get(VideoControllers);
export const authControllers = container.get(AuthControllers);
export const userControllers = container.get(UserControllers);
export const securityDeviceControllers = container.get(
  SecurityDeviceControllers,
);
export const testingControllers = container.get(TestingControllers);

export const blogsQueryRepository = container.get(BlogsQueryRepository);
export const commentsQueryRepository = container.get(CommentsQueryRepository);
export const jwtService = container.get(JwtService);
export const postsQueryRepository = container.get(PostsQueryRepository);
export const securityDevicesQueryRepository = container.get(
  SecurityDevicesQueryRepository,
);
export const usersQueryRepository = container.get(UsersQueryRepository);
export const usersRepository = container.get(UsersRepository);
