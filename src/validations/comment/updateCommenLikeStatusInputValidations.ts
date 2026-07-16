import {commonValidationForBodyStrings} from '../common';
import {commentLikeStatusValidation} from "./index";


export const updateCommentLikeStatusInputValidations = [
    commonValidationForBodyStrings('likeStatus'),
    commentLikeStatusValidation,
];
