import 'reflect-metadata';

import { JwtService } from '@/core/application/jwt-service';

import { AuthControllers } from '@/modules/auth';
import { BlogControllers, BlogsQueryRepository } from '@/modules/blogs';
import {
  CommentControllers,
  CommentsQueryRepository,
} from '@/modules/comments';
import { PostControllers, PostsQueryRepository } from '@/modules/posts';
import {
  SecurityDeviceControllers,
  SecurityDevicesQueryRepository,
} from '@/modules/security-devices';
import { TestingControllers } from '@/modules/testing';
import {
  UserControllers,
  UsersQueryRepository,
  UsersRepository,
} from '@/modules/users';
import { VideoControllers } from '@/modules/videos';

import { container } from './ioc/container';
import { isProduction } from './settings/env';

export const blogControllers = container.get(BlogControllers);
export const postControllers = container.get(PostControllers);
export const commentControllers = container.get(CommentControllers);
export const videoControllers = container.get(VideoControllers);
export const authControllers = container.get(AuthControllers);
export const userControllers = container.get(UserControllers);
export const securityDeviceControllers = container.get(
  SecurityDeviceControllers,
);

export const blogsQueryRepository = container.get(BlogsQueryRepository);
export const commentsQueryRepository = container.get(CommentsQueryRepository);
export const jwtService = container.get(JwtService);
export const postsQueryRepository = container.get(PostsQueryRepository);
export const securityDevicesQueryRepository = container.get(
  SecurityDevicesQueryRepository,
);
export const usersQueryRepository = container.get(UsersQueryRepository);
export const usersRepository = container.get(UsersRepository);

export const testingControllers = isProduction()
  ? undefined
  : container.get(TestingControllers);
