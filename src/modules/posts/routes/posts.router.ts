import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '@/core/middlewares/paramId-validation-middleware';

import { createCommentInputValidations } from '../../comments/validations/createCommentInputValidations';
import { POSTS_ROUTES } from '../constants/posts.paths';
import { PostControllers } from '../controllers/post-controllers';
import { PostValidations } from '../validations/post-shared-validators';

export type PostsRouterDeps = {
  postControllers: PostControllers;
  authMiddleware: RequestHandler;
  setUserDataMiddleware: RequestHandler;
  adminBasicAuthMiddleware: RequestHandler;
  validations: PostValidations;
};

export const createPostsRouter = ({
  postControllers,
  authMiddleware,
  setUserDataMiddleware,
  adminBasicAuthMiddleware,
  validations,
}: PostsRouterDeps) => {
  const router = Router({});

  router.get(
    POSTS_ROUTES.ROOT,
    setUserDataMiddleware,
    postControllers.getPosts.bind(postControllers),
  );
  router.get(
    POSTS_ROUTES.BY_ID,
    paramIdValidationMiddleware,
    setUserDataMiddleware,
    inputValidationsMiddleware,
    postControllers.getPost.bind(postControllers),
  );
  router.get(
    POSTS_ROUTES.COMMENTS,
    paramIdValidationMiddleware,
    setUserDataMiddleware,
    postControllers.getCommentsOfPost.bind(postControllers),
  );

  router.post(
    POSTS_ROUTES.ROOT,
    adminBasicAuthMiddleware,
    setUserDataMiddleware,
    validations.createPostInputValidations,
    inputValidationsMiddleware,
    postControllers.createPost.bind(postControllers),
  );
  router.post(
    POSTS_ROUTES.COMMENTS,
    authMiddleware,
    paramIdValidationMiddleware,
    createCommentInputValidations,
    inputValidationsMiddleware,
    postControllers.createCommentInPost.bind(postControllers),
  );

  router.put(
    POSTS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    paramIdValidationMiddleware,
    validations.updatePostInputValidations,
    inputValidationsMiddleware,
    postControllers.updatePost.bind(postControllers),
  );

  router.put(
    POSTS_ROUTES.LIKE_STATUS,
    paramIdValidationMiddleware,
    authMiddleware,
    validations.updatePostLikeStatusInputValidations,
    inputValidationsMiddleware,
    postControllers.updatePostLikeStatus.bind(postControllers),
  );

  router.delete(
    POSTS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    paramIdValidationMiddleware,
    postControllers.deletePost.bind(postControllers),
  );

  return router;
};
