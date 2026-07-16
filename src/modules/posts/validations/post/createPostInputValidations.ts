import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import {
  blogIdValidation,
  contentValidation,
  shortDescriptionValidation,
  titleValidation,
} from './index';

export const createPostInputValidations = [
  commonValidationForBodyStrings('title'),
  titleValidation,
  commonValidationForBodyStrings('shortDescription'),
  shortDescriptionValidation,
  commonValidationForBodyStrings('content'),
  contentValidation,
  commonValidationForBodyStrings('blogId'),
  blogIdValidation,
];
