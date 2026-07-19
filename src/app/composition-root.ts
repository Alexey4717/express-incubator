import 'reflect-metadata';

import { JwtService } from '@/core/application/jwt-service';
import { isProduction } from '@/core/settings/env';

import { AuthControllers } from '@/modules/auth';
import { BlogControllers } from '@/modules/blogs';
import { CommentControllers } from '@/modules/comments';
import { PostControllers } from '@/modules/posts';
import { SecurityDeviceControllers } from '@/modules/security-devices';
import {
  type ISecurityDevicesQueryRepository,
  SECURITY_DEVICES_TYPES,
} from '@/modules/security-devices';
import { TestingControllers } from '@/modules/testing';
import {
  type IUsersQueryRepository,
  UserControllers,
  USERS_TYPES,
} from '@/modules/users';
import { VideoControllers } from '@/modules/videos';

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

export const jwtService = container.get(JwtService);
export const usersQueryRepository = container.get<IUsersQueryRepository>(
  USERS_TYPES.IUsersQueryRepository,
);
export const securityDevicesQueryRepository =
  container.get<ISecurityDevicesQueryRepository>(
    SECURITY_DEVICES_TYPES.ISecurityDevicesQueryRepository,
  );

export const testingControllers = isProduction()
  ? undefined
  : container.get(TestingControllers);
