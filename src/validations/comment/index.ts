import {body} from "express-validator";
import {getCorrectCommentLikeStatus} from "../../helpers";


// validation for comment body (post and put methods)
export const contentValidation = body('content')
    .isLength({min: 20, max: 300}).withMessage("Max field length should be from 20 to 300 symbols");

// validation for comment/id/like-status body (put method)
export const commentLikeStatusValidation = body('likeStatus')
    .custom((value) => getCorrectCommentLikeStatus(value)).withMessage('Invalid likeStatus')
