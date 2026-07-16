import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { contentValidation } from './index';

export const createCommentInputValidations = [
  commonValidationForBodyStrings('content'),
  contentValidation,
];
