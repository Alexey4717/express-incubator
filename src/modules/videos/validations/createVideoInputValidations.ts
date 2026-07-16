import { commonValidationForBodyStrings } from '@/core/validations/common';

import {
  authorValidation,
  availableResolutionsValidation,
  titleValidation,
} from './video-field-validators';

export const createVideoInputValidations = [
  commonValidationForBodyStrings('title'),
  titleValidation,
  commonValidationForBodyStrings('author'),
  authorValidation,
  availableResolutionsValidation,
];
