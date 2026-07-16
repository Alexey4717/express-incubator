import { commonValidationForBodyStrings } from '../../../../core/validations/common';
import { emailResendingValidation } from './index';

export const registrationEmailResendingInputValidations = [
  commonValidationForBodyStrings('email'),
  emailResendingValidation,
];
