import { Router } from 'express';

import { commentControllers } from '../../../controllers/comment-controllers';
import { authMiddleware } from '../../../middlewares/auth-middleware';
import { inputValidationsMiddleware } from '../../../middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../middlewares/paramId-validation-middleware';
import { setUserDataMiddleware } from '../../../middlewares/set-user-data-middleware';
import { updateCommentLikeStatusInputValidations } from '../../../validations/comment/updateCommenLikeStatusInputValidations';
import { updateCommentInputValidations } from '../../../validations/comment/updateCommentInputValidations';

export const commentsRouter = Router({});

commentsRouter.get(
  '/:id',
  paramIdValidationMiddleware,
  setUserDataMiddleware,
  commentControllers.getComment,
);

commentsRouter.put(
  '/:commentId',
  authMiddleware,
  paramIdValidationMiddleware,
  updateCommentInputValidations,
  inputValidationsMiddleware,
  commentControllers.updateComment,
);
commentsRouter.put(
  '/:commentId/like-status',
  authMiddleware,
  paramIdValidationMiddleware,
  updateCommentLikeStatusInputValidations,
  inputValidationsMiddleware,
  commentControllers.changeLikeStatus,
);

commentsRouter.delete(
  '/:commentId',
  authMiddleware,
  paramIdValidationMiddleware,
  commentControllers.deleteComment,
);
