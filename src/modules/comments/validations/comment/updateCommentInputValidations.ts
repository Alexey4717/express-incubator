import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { contentValidation } from './index';

export const updateCommentInputValidations = [
  commonValidationForBodyStrings('content'),
  contentValidation,
];
