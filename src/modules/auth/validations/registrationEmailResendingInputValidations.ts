import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { AuthValidators } from './auth-shared-validators';

export const createRegistrationEmailResendingInputValidations = ({
  emailResendingValidation,
}: Pick<AuthValidators, 'emailResendingValidation'>) => [
  commonValidationForBodyStrings('email'),
  emailResendingValidation,
];
