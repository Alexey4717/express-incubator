import {commonValidationForBodyStrings} from "../common";
import {emailRecoveryPasswordValidation} from "./index";


export const passwordRecoveryInputValidations = [
    commonValidationForBodyStrings('email'),
    emailRecoveryPasswordValidation,
];
