import {commonValidationForBodyStrings} from '../common';
import {
    authorValidation,
    availableResolutionsValidation,
    canBeDownloadedValidation,
    minAgeRestrictionValidation,
    publicationDateValidation,
    titleValidation,
} from "./index";

export const updateVideoInputValidations = [
    commonValidationForBodyStrings('title'),
    titleValidation,
    commonValidationForBodyStrings('author'),
    authorValidation,
    availableResolutionsValidation,
    canBeDownloadedValidation,
    minAgeRestrictionValidation,
    publicationDateValidation
];
