import { commonValidationForBodyStrings } from '@/core/validations/common';

import { contentValidation } from './comment-field-validators';

export const createCommentInputValidations = [
  commonValidationForBodyStrings('content'),
  contentValidation,
];
