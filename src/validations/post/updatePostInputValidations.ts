import { commonValidationForBodyStrings } from '../common';
import {
  blogIdValidation,
  contentValidation,
  shortDescriptionValidation,
  titleValidation,
} from './index';

export const updatePostInputValidations = [
  commonValidationForBodyStrings('title'),
  titleValidation,
  commonValidationForBodyStrings('shortDescription'),
  shortDescriptionValidation,
  commonValidationForBodyStrings('content'),
  contentValidation,
  commonValidationForBodyStrings('blogId'),
  blogIdValidation,
];
