import { commonValidationForBodyStrings } from '../common';
import {
  contentValidation,
  shortDescriptionValidation,
  titleValidation,
} from '../post';

export const createPostInBlogInputValidations = [
  commonValidationForBodyStrings('title'),
  titleValidation,
  commonValidationForBodyStrings('shortDescription'),
  shortDescriptionValidation,
  commonValidationForBodyStrings('content'),
  contentValidation,
];
