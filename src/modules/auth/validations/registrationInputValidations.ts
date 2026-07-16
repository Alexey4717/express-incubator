import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { AuthValidators } from './auth-shared-validators';

export const createRegistrationInputValidations = ({
  loginValidation,
  passwordValidation,
  emailValidation,
}: Pick<
  AuthValidators,
  'loginValidation' | 'passwordValidation' | 'emailValidation'
>) => [
  commonValidationForBodyStrings('login'),
  loginValidation,
  commonValidationForBodyStrings('password'),
  passwordValidation,
  commonValidationForBodyStrings('email'),
  emailValidation,
];
