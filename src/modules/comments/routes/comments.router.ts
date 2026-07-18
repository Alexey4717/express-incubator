import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { mongoIdParamValidation } from '@/core/validations/common';

import { COMMENTS_ROUTES } from '../constants/comments.paths';
import { CommentControllers } from '../controllers/comment-controllers';
import { updateCommentLikeStatusInputValidations } from '../validations/updateCommenLikeStatusInputValidations';
import { updateCommentInputValidations } from '../validations/updateCommentInputValidations';

export type CommentsRouterDeps = {
  commentControllers: CommentControllers;
  authMiddleware: RequestHandler;
  setUserDataMiddleware: RequestHandler;
};

export const createCommentsRouter = ({
  commentControllers,
  authMiddleware,
  setUserDataMiddleware,
}: CommentsRouterDeps) => {
  const router = Router({});

  router.get(
    COMMENTS_ROUTES.BY_ID,
    mongoIdParamValidation('id'),
    setUserDataMiddleware,
    inputValidationsMiddleware,
    commentControllers.getComment.bind(commentControllers),
  );

  router.put(
    COMMENTS_ROUTES.BY_COMMENT_ID,
    authMiddleware,
    mongoIdParamValidation('commentId'),
    updateCommentInputValidations,
    inputValidationsMiddleware,
    commentControllers.updateComment.bind(commentControllers),
  );
  router.put(
    COMMENTS_ROUTES.LIKE_STATUS,
    authMiddleware,
    mongoIdParamValidation('commentId'),
    updateCommentLikeStatusInputValidations,
    inputValidationsMiddleware,
    commentControllers.changeLikeStatus.bind(commentControllers),
  );

  router.delete(
    COMMENTS_ROUTES.BY_COMMENT_ID,
    authMiddleware,
    mongoIdParamValidation('commentId'),
    inputValidationsMiddleware,
    commentControllers.deleteComment.bind(commentControllers),
  );

  return router;
};
