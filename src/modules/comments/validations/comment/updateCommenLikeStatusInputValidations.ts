import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { commentLikeStatusValidation } from './index';

export const updateCommentLikeStatusInputValidations = [
  commonValidationForBodyStrings('likeStatus'),
  commentLikeStatusValidation,
];
