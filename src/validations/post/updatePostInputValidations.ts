import {commonValidationForBodyStrings} from '../common';
import {
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation
} from "./index";


export const updatePostInputValidations = [
    commonValidationForBodyStrings('title'),
    titleValidation,
    commonValidationForBodyStrings('shortDescription'),
    shortDescriptionValidation,
    commonValidationForBodyStrings('content'),
    contentValidation,
    commonValidationForBodyStrings('blogId'),
    blogIdValidation
];
