import {body} from "express-validator";

import {usersRepository} from "../../repositories/CUD-repo/users-repository";


const findUserValidator = async (value: string, field: string) => {
    const foundUser = await usersRepository.findByLoginOrEmail(value);
    if (foundUser) throw new Error(`${field} already exists`);
    return true;
};

// validations for registration body post
export const loginValidation = body('login')
    .isLength({min: 3, max: 10}).withMessage("Max field length should be from 3 to 10 symbols")
    .matches(/^[a-zA-Z0-9_-]*$/).withMessage("Allowed only a-zA-Z0-9_- symbols")
    .custom(async (value) => await findUserValidator(value, 'Login'));
export const passwordValidation = body('password')
    .isLength({min: 6, max: 20}).withMessage("Max field length should be from 6 to 20 symbols");
export const emailValidation = body('email').isEmail({})
    .custom(async (value) => await findUserValidator(value, 'Email'));

// validations for registration-confirmation body post
export const codeValidation = body('code')
    .custom(async (value: string) => {
        const foundUser = await usersRepository.findByConfirmationCode(value);
        if (!foundUser) throw new Error(`User not found`);
        if (foundUser.emailConfirmation.isConfirmed) throw new Error(`Email already confirmed`);
        if (foundUser.emailConfirmation.confirmationCode !== value) throw new Error(`confirmationCode is not valid`);
        if (foundUser.emailConfirmation.expirationDate <= new Date()) throw new Error(`confirmationCode is expired`);
        return true;
    });

// validations for registration-email-resending
export const emailResendingValidation = body('email').isEmail({})
    .custom(async (value: string) => {
        const foundUser = await usersRepository.findByLoginOrEmail(value);
        if (!foundUser) throw new Error(`User not found`);
        if (foundUser.emailConfirmation.isConfirmed) throw new Error(`Email already confirmed`);
        return true;
    });

export const emailRecoveryPasswordValidation = body('email').isEmail({});

export const newPasswordValidation = body('newPassword')
    .isLength({min: 6, max: 20}).withMessage("Max field length should be from 6 to 20 symbols");
export const recoveryCodeValidation = body('recoveryCode')
    .custom(async (value: string) => {
        const foundUser = await usersRepository.findUserByRecoveryCode(value);
        if (!foundUser) throw new Error(`User not found`);
        if (!foundUser?.recoveryData || foundUser.recoveryData?.recoveryCode !== value) {
            throw new Error(`recoveryCode is not valid`);
        }
        if (foundUser.recoveryData.expirationDate <= new Date()) {
            throw new Error(`recoveryCode is expired`);
        }
        return true;
    });