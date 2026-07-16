import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import {
  contentValidation,
  shortDescriptionValidation,
  titleValidation,
} from '../../../posts/validations/post';

export const createPostInBlogInputValidations = [
  commonValidationForBodyStrings('title'),
  titleValidation,
  commonValidationForBodyStrings('shortDescription'),
  shortDescriptionValidation,
  commonValidationForBodyStrings('content'),
  contentValidation,
];
