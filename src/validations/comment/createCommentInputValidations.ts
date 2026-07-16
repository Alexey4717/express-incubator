import {commonValidationForBodyStrings} from '../common';
import {contentValidation} from "./index";


export const createCommentInputValidations = [
    commonValidationForBodyStrings('content'),
    contentValidation,
];
