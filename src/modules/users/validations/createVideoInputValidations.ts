import { commonValidationForBodyStrings } from '@/core/validations/common';

import {
  emailValidation,
  loginValidation,
  passwordValidation,
} from './user-field-validators';

export const createUserInputValidations = [
  commonValidationForBodyStrings('login'),
  loginValidation,
  commonValidationForBodyStrings('email'),
  emailValidation,
  commonValidationForBodyStrings('password'),
  passwordValidation,
];
