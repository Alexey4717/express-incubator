import { Router } from 'express';

import { postControllers } from '../../../app/composition-root';
import { adminBasicAuthMiddleware } from '../../../core/middlewares/admin-basicAuth-middleware';
import { authMiddleware } from '../../../core/middlewares/auth-middleware';
import { inputValidationsMiddleware } from '../../../core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../core/middlewares/paramId-validation-middleware';
import { setUserDataMiddleware } from '../../../core/middlewares/set-user-data-middleware';
import { createCommentInputValidations } from '../../comments/validations/comment/createCommentInputValidations';
import { POSTS_ROUTES } from '../constants/posts.paths';
import { createPostInputValidations } from '../validations/post/createPostInputValidations';
import { updatePostInputValidations } from '../validations/post/updatePostInputValidations';
import { updatePostLikeStatusInputValidations } from '../validations/post/updatePostLikeStatusInputValidations';

export const postsRouter = Router({});

postsRouter.get(
  POSTS_ROUTES.ROOT,
  setUserDataMiddleware,
  postControllers.getPosts.bind(postControllers),
);
postsRouter.get(
  POSTS_ROUTES.BY_ID,
  paramIdValidationMiddleware,
  setUserDataMiddleware,
  inputValidationsMiddleware,
  postControllers.getPost.bind(postControllers),
);
postsRouter.get(
  POSTS_ROUTES.COMMENTS,
  paramIdValidationMiddleware,
  setUserDataMiddleware,
  postControllers.getCommentsOfPost.bind(postControllers),
);

postsRouter.post(
  POSTS_ROUTES.ROOT,
  adminBasicAuthMiddleware,
  setUserDataMiddleware,
  createPostInputValidations,
  inputValidationsMiddleware,
  postControllers.createPost.bind(postControllers),
);
postsRouter.post(
  POSTS_ROUTES.COMMENTS,
  authMiddleware,
  paramIdValidationMiddleware,
  createCommentInputValidations,
  inputValidationsMiddleware,
  postControllers.createCommentInPost.bind(postControllers),
);

postsRouter.put(
  POSTS_ROUTES.BY_ID,
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  updatePostInputValidations,
  inputValidationsMiddleware,
  postControllers.updatePost.bind(postControllers),
);

postsRouter.put(
  POSTS_ROUTES.LIKE_STATUS,
  paramIdValidationMiddleware,
  authMiddleware,
  updatePostLikeStatusInputValidations,
  inputValidationsMiddleware,
  postControllers.updatePostLikeStatus.bind(postControllers),
);

postsRouter.delete(
  POSTS_ROUTES.BY_ID,
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  postControllers.deletePost.bind(postControllers),
);
