import {
    loginValidation,
    emailValidation,
    passwordValidation,
} from "./index";
import {commonValidationForBodyStrings} from "../common";


export const createUserInputValidations = [
    commonValidationForBodyStrings('login'),
    loginValidation,
    commonValidationForBodyStrings('email'),
    emailValidation,
    commonValidationForBodyStrings('password'),
    passwordValidation,
];
