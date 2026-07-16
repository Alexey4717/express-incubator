import { commonValidationForBodyStrings } from '../../../../core/validations/common';

export const loginInputValidations = [
  commonValidationForBodyStrings('loginOrEmail'),
  commonValidationForBodyStrings('password'),
];
