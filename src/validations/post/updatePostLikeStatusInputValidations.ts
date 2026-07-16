import {commonValidationForBodyStrings} from '../common';
import {postLikeStatusValidation} from "./index";


export const updatePostLikeStatusInputValidations = [
    commonValidationForBodyStrings('likeStatus'),
    postLikeStatusValidation,
];
