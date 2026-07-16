import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { codeValidation } from './index';

export const registrationConfirmationInputValidations = [
  commonValidationForBodyStrings('code'),
  codeValidation,
];
