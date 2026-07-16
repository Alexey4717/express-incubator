import {commonValidationForBodyStrings} from "../common";


export const loginInputValidations = [
    commonValidationForBodyStrings('loginOrEmail'),
    commonValidationForBodyStrings('password'),
];
