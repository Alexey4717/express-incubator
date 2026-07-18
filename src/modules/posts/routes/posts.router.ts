import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { paginationAndSortingValidation } from '@/core/middlewares/query-pagination-sorting.validation.middleware';
import { mongoIdParamValidation } from '@/core/validations/common';

import { SORT_POST_COMMENTS_FIELDS } from '../../comments/models/GetPostCommentsInputModel';
import { createCommentInputValidations } from '../../comments/validations/createCommentInputValidations';
import { POSTS_ROUTES } from '../constants/posts.paths';
import { PostControllers } from '../controllers/post-controllers';
import { SORT_POSTS_FIELDS } from '../models/GetPostsInputModel';
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
    ...paginationAndSortingValidation(SORT_POSTS_FIELDS),
    inputValidationsMiddleware,
    postControllers.getPosts.bind(postControllers),
  );
  router.get(
    POSTS_ROUTES.BY_ID,
    mongoIdParamValidation('id'),
    setUserDataMiddleware,
    inputValidationsMiddleware,
    postControllers.getPost.bind(postControllers),
  );
  router.get(
    POSTS_ROUTES.COMMENTS,
    mongoIdParamValidation('postId'),
    setUserDataMiddleware,
    ...paginationAndSortingValidation(SORT_POST_COMMENTS_FIELDS),
    inputValidationsMiddleware,
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
    mongoIdParamValidation('postId'),
    createCommentInputValidations,
    inputValidationsMiddleware,
    postControllers.createCommentInPost.bind(postControllers),
  );

  router.put(
    POSTS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    mongoIdParamValidation('id'),
    validations.updatePostInputValidations,
    inputValidationsMiddleware,
    postControllers.updatePost.bind(postControllers),
  );

  router.put(
    POSTS_ROUTES.LIKE_STATUS,
    mongoIdParamValidation('postId'),
    authMiddleware,
    validations.updatePostLikeStatusInputValidations,
    inputValidationsMiddleware,
    postControllers.updatePostLikeStatus.bind(postControllers),
  );

  router.delete(
    POSTS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    mongoIdParamValidation('id'),
    inputValidationsMiddleware,
    postControllers.deletePost.bind(postControllers),
  );

  return router;
};
