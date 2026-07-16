import {
    titleValidation,
    authorValidation,
    availableResolutionsValidation,
} from "./index";
import {commonValidationForBodyStrings} from "../common";


export const createVideoInputValidations = [
    commonValidationForBodyStrings('title'),
    titleValidation,
    commonValidationForBodyStrings('author'),
    authorValidation,
    availableResolutionsValidation,
];
