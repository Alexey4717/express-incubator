import {commonValidationForBodyStrings} from "../common";
import {codeValidation} from "./index";


export const registrationConfirmationInputValidations = [
    commonValidationForBodyStrings('code'),
    codeValidation,
];
