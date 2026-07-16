import { commonValidationForBodyStrings } from '@/core/validations/common';

import { contentValidation } from './comment-field-validators';

export const updateCommentInputValidations = [
  commonValidationForBodyStrings('content'),
  contentValidation,
];
