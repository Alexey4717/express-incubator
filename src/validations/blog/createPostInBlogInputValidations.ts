import {commonValidationForBodyStrings} from '../common';
import {
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
} from "../post";


export const createPostInBlogInputValidations = [
    commonValidationForBodyStrings('title'),
    titleValidation,
    commonValidationForBodyStrings('shortDescription'),
    shortDescriptionValidation,
    commonValidationForBodyStrings('content'),
    contentValidation,
];
