import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { emailValidation, loginValidation, passwordValidation } from './index';

export const createUserInputValidations = [
  commonValidationForBodyStrings('login'),
  loginValidation,
  commonValidationForBodyStrings('email'),
  emailValidation,
  commonValidationForBodyStrings('password'),
  passwordValidation,
];
