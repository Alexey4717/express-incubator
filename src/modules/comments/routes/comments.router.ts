import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '@/core/middlewares/paramId-validation-middleware';

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
    paramIdValidationMiddleware,
    setUserDataMiddleware,
    commentControllers.getComment.bind(commentControllers),
  );

  router.put(
    COMMENTS_ROUTES.BY_COMMENT_ID,
    authMiddleware,
    paramIdValidationMiddleware,
    updateCommentInputValidations,
    inputValidationsMiddleware,
    commentControllers.updateComment.bind(commentControllers),
  );
  router.put(
    COMMENTS_ROUTES.LIKE_STATUS,
    authMiddleware,
    paramIdValidationMiddleware,
    updateCommentLikeStatusInputValidations,
    inputValidationsMiddleware,
    commentControllers.changeLikeStatus.bind(commentControllers),
  );

  router.delete(
    COMMENTS_ROUTES.BY_COMMENT_ID,
    authMiddleware,
    paramIdValidationMiddleware,
    commentControllers.deleteComment.bind(commentControllers),
  );

  return router;
};
