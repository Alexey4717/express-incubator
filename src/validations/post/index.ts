import {body} from "express-validator";
import {blogsQueryRepository} from "../../repositories/Queries-repo/blogs-query-repository";
import {getCorrectCommentLikeStatus} from "../../helpers";


// validations for post body (post and put methods)
export const titleValidation = body('title')
    .isLength({max: 30}).withMessage("Max field length shouldn`t be more than 30 symbols");
export const shortDescriptionValidation = body('shortDescription')
    .isLength({max: 100}).withMessage("Max field length shouldn`t be more than 100 symbols");
export const contentValidation = body('content')
    .isLength({max: 1000}).withMessage("Max field length shouldn`t be more than 1000 symbols");
export const blogIdValidation = body('blogId')
    .custom(async (value, {req}) => {
        const foundBlog = await blogsQueryRepository.findBlogById(value);
        if (!foundBlog) throw new Error('Blog not found by passed blogId');
        return true;
    })

// validation for comment/id/like-status body (put method)
export const postLikeStatusValidation = body('likeStatus')
    .custom((value) => getCorrectCommentLikeStatus(value)).withMessage('Invalid likeStatus')
