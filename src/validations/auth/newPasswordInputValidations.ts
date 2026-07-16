import {commonValidationForBodyStrings} from "../common";
import {newPasswordValidation, recoveryCodeValidation} from "./index";


export const newPasswordInputValidations = [
    commonValidationForBodyStrings('newPassword'),
    newPasswordValidation,
    commonValidationForBodyStrings('recoveryCode'),
    recoveryCodeValidation,
];
