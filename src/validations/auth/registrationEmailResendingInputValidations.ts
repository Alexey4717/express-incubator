import {commonValidationForBodyStrings} from "../common";
import {emailResendingValidation} from "./index";


export const registrationEmailResendingInputValidations = [
    commonValidationForBodyStrings('email'),
    emailResendingValidation
];
