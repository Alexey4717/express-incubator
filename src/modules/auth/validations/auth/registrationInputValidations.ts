import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { emailValidation, loginValidation, passwordValidation } from './index';

export const registrationInputValidations = [
  commonValidationForBodyStrings('login'),
  loginValidation,
  commonValidationForBodyStrings('password'),
  passwordValidation,
  commonValidationForBodyStrings('email'),
  emailValidation,
];
