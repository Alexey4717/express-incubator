import { Container } from 'inversify';
import 'reflect-metadata';

import { JwtService } from '../../core/application/jwt-service';
import { EmailManager } from '../../core/managers/email-manager';
import { AuthControllers } from '../../modules/auth/controllers/auth-controllers';
import { AuthService } from '../../modules/auth/services/auth-service';
import { EmailService } from '../../modules/auth/services/email-service';
import { BlogControllers } from '../../modules/blogs/controllers/blog-controllers';
import { BlogsRepository } from '../../modules/blogs/repositories/CUD/blogs-repository';
import { BlogsQueryRepository } from '../../modules/blogs/repositories/Queries/blogs-query-repository';
import { BlogsService } from '../../modules/blogs/services/blogs-service';
import { CommentControllers } from '../../modules/comments/controllers/comment-controllers';
import { CommentsRepository } from '../../modules/comments/repositories/CUD/comments-repository';
import { CommentsQueryRepository } from '../../modules/comments/repositories/Queries/comments-query-repository';
import { CommentsService } from '../../modules/comments/services/comments-service';
import { PostControllers } from '../../modules/posts/controllers/post-controllers';
import { PostsRepository } from '../../modules/posts/repositories/CUD/posts-repository';
import { PostsQueryRepository } from '../../modules/posts/repositories/Queries/posts-query-repository';
import { PostsService } from '../../modules/posts/services/posts-service';
import { SecurityDeviceControllers } from '../../modules/security-devices/controllers/security-device-controllers';
import { SecurityDevicesRepository } from '../../modules/security-devices/repositories/CUD/security-devices-repository';
import { SecurityDevicesQueryRepository } from '../../modules/security-devices/repositories/Queries/security-devices-query-repository';
import { SecurityDevicesService } from '../../modules/security-devices/services/security-devices-service';
import { TestingControllers } from '../../modules/testing/controllers/testing-controllers';
import { UserControllers } from '../../modules/users/controllers/user-controllers';
import { UsersRepository } from '../../modules/users/repositories/CUD/users-repository';
import { UsersQueryRepository } from '../../modules/users/repositories/Queries/users-query-repository';
import { VideoControllers } from '../../modules/videos/controllers/video-controllers';
import { VideosRepository } from '../../modules/videos/repositories/CUD/videos-repository';
import { VideosQueryRepository } from '../../modules/videos/repositories/Queries/videos-query-repository';
import { VideosService } from '../../modules/videos/services/videos-service';

export const container = new Container({ defaultScope: 'Singleton' });

const bindings = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsQueryRepository,
  PostsRepository,
  CommentsQueryRepository,
  CommentsRepository,
  VideosRepository,
  VideosQueryRepository,
  UsersRepository,
  UsersQueryRepository,
  SecurityDevicesRepository,
  SecurityDevicesQueryRepository,
  BlogsService,
  PostsService,
  CommentsService,
  VideosService,
  JwtService,
  EmailService,
  EmailManager,
  AuthService,
  SecurityDevicesService,
  BlogControllers,
  PostControllers,
  CommentControllers,
  VideoControllers,
  AuthControllers,
  UserControllers,
  SecurityDeviceControllers,
  TestingControllers,
] as const;

bindings.forEach((binding) => {
  container.bind(binding).toSelf();
});
