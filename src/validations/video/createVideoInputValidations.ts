import { commonValidationForBodyStrings } from '../common';
import {
  authorValidation,
  availableResolutionsValidation,
  titleValidation,
} from './index';

export const createVideoInputValidations = [
  commonValidationForBodyStrings('title'),
  titleValidation,
  commonValidationForBodyStrings('author'),
  authorValidation,
  availableResolutionsValidation,
];
