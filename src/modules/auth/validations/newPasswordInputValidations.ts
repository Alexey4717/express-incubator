import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { AuthValidators } from './auth-shared-validators';

export const createNewPasswordInputValidations = ({
  newPasswordValidation,
  recoveryCodeValidation,
}: Pick<
  AuthValidators,
  'newPasswordValidation' | 'recoveryCodeValidation'
>) => [
  commonValidationForBodyStrings('newPassword'),
  newPasswordValidation,
  commonValidationForBodyStrings('recoveryCode'),
  recoveryCodeValidation,
];
