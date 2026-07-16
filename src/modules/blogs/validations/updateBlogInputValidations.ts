import { commonValidationForBodyStrings } from '@/core/validations/common';

import {
  descriptionValidation,
  nameValidation,
  websiteUrlValidation,
} from './blog-field-validators';

export const updateBlogInputValidations = [
  commonValidationForBodyStrings('name'),
  nameValidation,
  commonValidationForBodyStrings('description'),
  descriptionValidation,
  commonValidationForBodyStrings('websiteUrl'),
  websiteUrlValidation,
];
