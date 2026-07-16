import {commonValidationForBodyStrings} from '../common';
import {contentValidation} from "./index";


export const updateCommentInputValidations = [
    commonValidationForBodyStrings('content'),
    contentValidation,
];
