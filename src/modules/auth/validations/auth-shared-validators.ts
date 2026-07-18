import { body } from 'express-validator';

import { UsersQueryRepository } from '../../users/repositories/Queries/users-query-repository';
import { createLoginInputValidations } from './loginInputValidations';
import { createNewPasswordInputValidations } from './newPasswordInputValidations';
import { createPasswordRecoveryInputValidations } from './passwordRecoveryInputValidations';
import { createRegistrationConfirmationInputValidations } from './registrationConfirmationInputValidations';
import { createRegistrationEmailResendingInputValidations } from './registrationEmailResendingInputValidations';
import { createRegistrationInputValidations } from './registrationInputValidations';

export type AuthValidators = {
  loginValidation: ReturnType<typeof body>;
  passwordValidation: ReturnType<typeof body>;
  emailValidation: ReturnType<typeof body>;
  codeValidation: ReturnType<typeof body>;
  emailResendingValidation: ReturnType<typeof body>;
  emailRecoveryPasswordValidation: ReturnType<typeof body>;
  newPasswordValidation: ReturnType<typeof body>;
  recoveryCodeValidation: ReturnType<typeof body>;
};

export type AuthValidations = AuthValidators & {
  loginInputValidations: ReturnType<typeof createLoginInputValidations>;
  registrationInputValidations: ReturnType<
    typeof createRegistrationInputValidations
  >;
  registrationConfirmationInputValidations: ReturnType<
    typeof createRegistrationConfirmationInputValidations
  >;
  passwordRecoveryInputValidations: ReturnType<
    typeof createPasswordRecoveryInputValidations
  >;
  newPasswordInputValidations: ReturnType<
    typeof createNewPasswordInputValidations
  >;
  registrationEmailResendingInputValidations: ReturnType<
    typeof createRegistrationEmailResendingInputValidations
  >;
};

export const createAuthValidations = (
  usersQueryRepository: UsersQueryRepository,
): AuthValidations => {
  const findUserValidator = async (value: string, field: string) => {
    const foundUser = await usersQueryRepository.findByLoginOrEmail(value);
    if (foundUser) throw new Error(`${field} already exists`);
    return true;
  };

  const loginValidation = body('login')
    .isLength({ min: 3, max: 10 })
    .withMessage('Max field length should be from 3 to 10 symbols')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Allowed only a-zA-Z0-9_- symbols')
    .custom(async (value) => await findUserValidator(value, 'Login'));
  const passwordValidation = body('password')
    .isLength({ min: 6, max: 20 })
    .withMessage('Max field length should be from 6 to 20 symbols');
  const emailValidation = body('email')
    .isEmail({})
    .custom(async (value) => await findUserValidator(value, 'Email'));

  const codeValidation = body('code').custom(async (value: string) => {
    const foundUser = await usersQueryRepository.findByConfirmationCode(value);
    if (!foundUser) throw new Error(`User not found`);
    if (foundUser.emailConfirmation.isConfirmed)
      throw new Error(`Email already confirmed`);
    if (foundUser.emailConfirmation.confirmationCode !== value)
      throw new Error(`confirmationCode is not valid`);
    if (foundUser.emailConfirmation.expirationDate <= new Date())
      throw new Error(`confirmationCode is expired`);
    return true;
  });

  const emailResendingValidation = body('email')
    .isEmail({})
    .custom(async (value: string) => {
      const foundUser = await usersQueryRepository.findByLoginOrEmail(value);
      if (!foundUser) throw new Error(`User not found`);
      if (foundUser.emailConfirmation.isConfirmed)
        throw new Error(`Email already confirmed`);
      return true;
    });

  const emailRecoveryPasswordValidation = body('email').isEmail({});

  const newPasswordValidation = body('newPassword')
    .isLength({ min: 6, max: 20 })
    .withMessage('Max field length should be from 6 to 20 symbols');
  const recoveryCodeValidation = body('recoveryCode').custom(
    async (value: string) => {
      const foundUser =
        await usersQueryRepository.findUserByRecoveryCode(value);
      if (!foundUser) throw new Error(`User not found`);
      if (
        !foundUser?.recoveryData ||
        foundUser.recoveryData?.recoveryCode !== value
      ) {
        throw new Error(`recoveryCode is not valid`);
      }
      if (foundUser.recoveryData.expirationDate <= new Date()) {
        throw new Error(`recoveryCode is expired`);
      }
      return true;
    },
  );

  const validators: AuthValidators = {
    loginValidation,
    passwordValidation,
    emailValidation,
    codeValidation,
    emailResendingValidation,
    emailRecoveryPasswordValidation,
    newPasswordValidation,
    recoveryCodeValidation,
  };

  return {
    ...validators,
    loginInputValidations: createLoginInputValidations(),
    registrationInputValidations:
      createRegistrationInputValidations(validators),
    registrationConfirmationInputValidations:
      createRegistrationConfirmationInputValidations(validators),
    passwordRecoveryInputValidations:
      createPasswordRecoveryInputValidations(validators),
    newPasswordInputValidations: createNewPasswordInputValidations(validators),
    registrationEmailResendingInputValidations:
      createRegistrationEmailResendingInputValidations(validators),
  };
};
