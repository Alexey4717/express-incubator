import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { AuthValidators } from './auth-shared-validators';

export const createRegistrationConfirmationInputValidations = ({
  codeValidation,
}: Pick<AuthValidators, 'codeValidation'>) => [
  commonValidationForBodyStrings('code'),
  codeValidation,
];
