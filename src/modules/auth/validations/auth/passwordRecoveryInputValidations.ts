import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { emailRecoveryPasswordValidation } from './index';

export const passwordRecoveryInputValidations = [
  commonValidationForBodyStrings('email'),
  emailRecoveryPasswordValidation,
];
