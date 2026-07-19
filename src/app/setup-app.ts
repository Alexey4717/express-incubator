import express, { Express, NextFunction, Request, Response } from 'express';

import cookieParser from 'cookie-parser';
import cors from 'cors';

import { createGlobalExceptionFilter } from '@/core/exceptions/filters/global-exception.filter';
import { createAdminBasicAuthMiddleware } from '@/core/middlewares/admin-basicAuth-middleware';
import { createAuthMiddleware } from '@/core/middlewares/auth-middleware';
import { createCookieRefreshTokenMiddleware } from '@/core/middlewares/cookie-refresh-token-middleware';
import { createSetUserDataMiddleware } from '@/core/middlewares/set-user-data-middleware';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '@/core/settings/config';
import { isProduction } from '@/core/settings/env';
import { RequestContextType } from '@/core/types/request-context';

import {
  AUTH_PATH,
  createAuthRouter,
  createAuthValidations,
} from '@/modules/auth';
import {
  BLOGS_PATH,
  createBlogsRouter,
  createPostInBlogInputValidations,
} from '@/modules/blogs';
import { COMMENTS_PATH, createCommentsRouter } from '@/modules/comments';
import {
  createPostsRouter,
  createPostValidations,
  POSTS_PATH,
} from '@/modules/posts';
import {
  createSecurityDevicesRouter,
  SECURITY_DEVICES_PATH,
} from '@/modules/security-devices';
import { createTestingRouter, TESTING_PATH } from '@/modules/testing';
import { createUsersRouter, USERS_PATH } from '@/modules/users';
import { createVideosRouter, VIDEOS_PATH } from '@/modules/videos';

import {
  authControllers,
  blogControllers,
  commentControllers,
  jwtService,
  postControllers,
  securityDeviceControllers,
  securityDevicesQueryRepository,
  testingControllers,
  userControllers,
  usersQueryRepository,
  videoControllers,
} from './composition-root';
import { setupSwagger } from './swagger.setup';

export const setupApp = (app: Express) => {
  app.set('trust proxy', true);

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.context = {} as RequestContextType;
    next();
  });

  const authMiddleware = createAuthMiddleware({
    jwtService,
    usersQueryRepository,
  });
  const setUserDataMiddleware = createSetUserDataMiddleware({
    jwtService,
    usersQueryRepository,
  });
  const cookieRefreshTokenMiddleware = createCookieRefreshTokenMiddleware({
    jwtService,
    usersQueryRepository,
    securityDevicesQueryRepository,
  });
  const adminBasicAuthMiddleware = createAdminBasicAuthMiddleware({
    adminUsername: ADMIN_USERNAME,
    adminPassword: ADMIN_PASSWORD,
  });

  const authValidations = createAuthValidations(usersQueryRepository);
  const postValidations = createPostValidations();

  app.use(
    AUTH_PATH,
    createAuthRouter({
      authControllers,
      authMiddleware,
      cookieRefreshTokenMiddleware,
      validations: authValidations,
    }),
  );
  app.use(
    USERS_PATH,
    createUsersRouter({ userControllers, adminBasicAuthMiddleware }),
  );
  app.use(VIDEOS_PATH, createVideosRouter({ videoControllers }));
  app.use(
    BLOGS_PATH,
    createBlogsRouter({
      blogControllers,
      setUserDataMiddleware,
      adminBasicAuthMiddleware,
      createPostInBlogInputValidations:
        createPostInBlogInputValidations(postValidations),
    }),
  );
  app.use(
    POSTS_PATH,
    createPostsRouter({
      postControllers,
      authMiddleware,
      setUserDataMiddleware,
      adminBasicAuthMiddleware,
      validations: postValidations,
    }),
  );
  app.use(
    COMMENTS_PATH,
    createCommentsRouter({
      commentControllers,
      authMiddleware,
      setUserDataMiddleware,
    }),
  );
  app.use(
    SECURITY_DEVICES_PATH,
    createSecurityDevicesRouter({
      securityDeviceControllers,
      cookieRefreshTokenMiddleware,
    }),
  );

  if (!isProduction() && testingControllers) {
    app.use(TESTING_PATH, createTestingRouter({ testingControllers }));
  }

  app.get('/', (req: Request, res: Response) => {
    res.send('main page');
  });

  setupSwagger(app);

  // Обязательно последним, им next дальше не выполняется
  app.use(createGlobalExceptionFilter());

  return app;
};
