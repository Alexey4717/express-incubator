import { Router } from 'express';

import { commentControllers } from '../../../app/composition-root';
import { authMiddleware } from '../../../core/middlewares/auth-middleware';
import { inputValidationsMiddleware } from '../../../core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../core/middlewares/paramId-validation-middleware';
import { setUserDataMiddleware } from '../../../core/middlewares/set-user-data-middleware';
import { COMMENTS_ROUTES } from '../constants/comments.paths';
import { updateCommentLikeStatusInputValidations } from '../validations/comment/updateCommenLikeStatusInputValidations';
import { updateCommentInputValidations } from '../validations/comment/updateCommentInputValidations';

export const commentsRouter = Router({});

commentsRouter.get(
  COMMENTS_ROUTES.BY_ID,
  paramIdValidationMiddleware,
  setUserDataMiddleware,
  commentControllers.getComment.bind(commentControllers),
);

commentsRouter.put(
  COMMENTS_ROUTES.BY_COMMENT_ID,
  authMiddleware,
  paramIdValidationMiddleware,
  updateCommentInputValidations,
  inputValidationsMiddleware,
  commentControllers.updateComment.bind(commentControllers),
);
commentsRouter.put(
  COMMENTS_ROUTES.LIKE_STATUS,
  authMiddleware,
  paramIdValidationMiddleware,
  updateCommentLikeStatusInputValidations,
  inputValidationsMiddleware,
  commentControllers.changeLikeStatus.bind(commentControllers),
);

commentsRouter.delete(
  COMMENTS_ROUTES.BY_COMMENT_ID,
  authMiddleware,
  paramIdValidationMiddleware,
  commentControllers.deleteComment.bind(commentControllers),
);
