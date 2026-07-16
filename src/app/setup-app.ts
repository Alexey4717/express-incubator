import express, { Express, NextFunction, Request, Response } from 'express';

import cookieParser from 'cookie-parser';
import cors from 'cors';

import { RequestContextType } from '../core/types/common';
import { AUTH_PATH } from '../modules/auth/constants/auth.paths';
import { authRouter } from '../modules/auth/routes/auth.router';
import { BLOGS_PATH } from '../modules/blogs/constants/blogs.paths';
import { blogsRouter } from '../modules/blogs/routes/blogs.router';
import { COMMENTS_PATH } from '../modules/comments/constants/comments.paths';
import { commentsRouter } from '../modules/comments/routes/comments.router';
import { POSTS_PATH } from '../modules/posts/constants/posts.paths';
import { postsRouter } from '../modules/posts/routes/posts.router';
import { SECURITY_DEVICES_PATH } from '../modules/security-devices/constants/security-devices.paths';
import { securityDevicesRouter } from '../modules/security-devices/routes/security-devices.router';
import { TESTING_PATH } from '../modules/testing/constants/testing.paths';
import { testingRouter } from '../modules/testing/routes/testing.router';
import { USERS_PATH } from '../modules/users/constants/users.paths';
import { usersRouter } from '../modules/users/routes/users.router';
import { VIDEOS_PATH } from '../modules/videos/constants/videos.paths';
import { videosRouter } from '../modules/videos/routes/videos.router';
import { setupSwagger } from './swagger.setup';

export const setupApp = (app: Express) => {
  app.set('trust proxy', true);

  app.use(cors()); // Разрешает запросы с любых доменов
  app.use(cookieParser());
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.context = {} as RequestContextType;
    next();
  });

  app.use(AUTH_PATH, authRouter);
  app.use(USERS_PATH, usersRouter);
  app.use(VIDEOS_PATH, videosRouter);
  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(COMMENTS_PATH, commentsRouter);
  app.use(SECURITY_DEVICES_PATH, securityDevicesRouter);
  app.use(TESTING_PATH, testingRouter);

  app.get('/', (req: Request, res: Response) => {
    res.send('main page');
  });

  setupSwagger(app);

  return app;
};
