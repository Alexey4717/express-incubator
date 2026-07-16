import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { AuthValidators } from './auth-shared-validators';

export const createPasswordRecoveryInputValidations = ({
  emailRecoveryPasswordValidation,
}: Pick<AuthValidators, 'emailRecoveryPasswordValidation'>) => [
  commonValidationForBodyStrings('email'),
  emailRecoveryPasswordValidation,
];
