import { commonValidationForBodyStrings } from '@/core/validations/common';

export const createLoginInputValidations = () => [
  commonValidationForBodyStrings('loginOrEmail'),
  commonValidationForBodyStrings('password'),
];
