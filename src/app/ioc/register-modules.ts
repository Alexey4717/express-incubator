import { Container } from 'inversify';

import { JwtService } from '@/core/application/jwt-service';

import {
  AuthControllers,
  AuthService,
  EmailManager,
  EmailService,
} from '@/modules/auth';
import {
  BlogControllers,
  BlogsQueryRepository,
  BlogsRepository,
  BlogsService,
} from '@/modules/blogs';
import {
  CommentControllers,
  CommentsQueryRepository,
  CommentsRepository,
  CommentsService,
} from '@/modules/comments';
import {
  PostControllers,
  PostsQueryRepository,
  PostsRepository,
  PostsService,
} from '@/modules/posts';
import {
  SecurityDeviceControllers,
  SecurityDevicesQueryRepository,
  SecurityDevicesRepository,
  SecurityDevicesService,
} from '@/modules/security-devices';
import { TestingControllers } from '@/modules/testing';
import {
  UserControllers,
  UsersQueryRepository,
  UsersRepository,
  UsersService,
} from '@/modules/users';
import {
  VideoControllers,
  VideosQueryRepository,
  VideosRepository,
  VideosService,
} from '@/modules/videos';

import { isProduction } from '../settings/env';

export const registerModules = (container: Container): void => {
  container.bind(JwtService).toSelf();

  container.bind(UsersRepository).toSelf();
  container.bind(UsersQueryRepository).toSelf();
  container.bind(UsersService).toSelf();
  container.bind(UserControllers).toSelf();

  container.bind(AuthService).toSelf();
  container.bind(EmailService).toSelf();
  container.bind(EmailManager).toSelf();
  container.bind(AuthControllers).toSelf();

  container.bind(BlogsRepository).toSelf();
  container.bind(BlogsQueryRepository).toSelf();
  container.bind(BlogsService).toSelf();
  container.bind(BlogControllers).toSelf();

  container.bind(PostsRepository).toSelf();
  container.bind(PostsQueryRepository).toSelf();
  container.bind(PostsService).toSelf();
  container.bind(PostControllers).toSelf();

  container.bind(CommentsRepository).toSelf();
  container.bind(CommentsQueryRepository).toSelf();
  container.bind(CommentsService).toSelf();
  container.bind(CommentControllers).toSelf();

  container.bind(VideosRepository).toSelf();
  container.bind(VideosQueryRepository).toSelf();
  container.bind(VideosService).toSelf();
  container.bind(VideoControllers).toSelf();

  container.bind(SecurityDevicesRepository).toSelf();
  container.bind(SecurityDevicesQueryRepository).toSelf();
  container.bind(SecurityDevicesService).toSelf();
  container.bind(SecurityDeviceControllers).toSelf();

  if (!isProduction()) {
    container.bind(TestingControllers).toSelf();
  }
};
