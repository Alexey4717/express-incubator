import { commonValidationForBodyStrings } from '@/core/validations/common';

import { commentLikeStatusValidation } from './comment-field-validators';

export const updateCommentLikeStatusInputValidations = [
  commonValidationForBodyStrings('likeStatus'),
  commentLikeStatusValidation,
];
