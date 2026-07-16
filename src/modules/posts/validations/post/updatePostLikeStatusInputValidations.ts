import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { postLikeStatusValidation } from './index';

export const updatePostLikeStatusInputValidations = [
  commonValidationForBodyStrings('likeStatus'),
  postLikeStatusValidation,
];
