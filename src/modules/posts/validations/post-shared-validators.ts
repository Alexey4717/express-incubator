import { body } from 'express-validator';

import { getCorrectCommentLikeStatus } from '@/core/helpers';

import { BlogsQueryRepository } from '../../blogs/repositories/Queries/blogs-query-repository';
import { createCreatePostInputValidations } from './createPostInputValidations';
import { createUpdatePostInputValidations } from './updatePostInputValidations';
import { createUpdatePostLikeStatusInputValidations } from './updatePostLikeStatusInputValidations';

export type PostValidators = {
  titleValidation: ReturnType<typeof body>;
  shortDescriptionValidation: ReturnType<typeof body>;
  contentValidation: ReturnType<typeof body>;
  blogIdValidation: ReturnType<typeof body>;
  postLikeStatusValidation: ReturnType<typeof body>;
};

export type PostValidations = PostValidators & {
  createPostInputValidations: ReturnType<
    typeof createCreatePostInputValidations
  >;
  updatePostInputValidations: ReturnType<
    typeof createUpdatePostInputValidations
  >;
  updatePostLikeStatusInputValidations: ReturnType<
    typeof createUpdatePostLikeStatusInputValidations
  >;
};

export const createPostValidations = (
  blogsQueryRepository: BlogsQueryRepository,
): PostValidations => {
  const titleValidation = body('title')
    .isLength({ max: 30 })
    .withMessage('Max field length shouldn`t be more than 30 symbols');
  const shortDescriptionValidation = body('shortDescription')
    .isLength({ max: 100 })
    .withMessage('Max field length shouldn`t be more than 100 symbols');
  const contentValidation = body('content')
    .isLength({ max: 1000 })
    .withMessage('Max field length shouldn`t be more than 1000 symbols');
  const blogIdValidation = body('blogId').custom(async (value) => {
    const foundBlog = await blogsQueryRepository.findBlogById(value);
    if (!foundBlog) throw new Error('Blog not found by passed blogId');
    return true;
  });
  const postLikeStatusValidation = body('likeStatus')
    .custom((value) => getCorrectCommentLikeStatus(value))
    .withMessage('Invalid likeStatus');

  const validators: PostValidators = {
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    postLikeStatusValidation,
  };

  return {
    ...validators,
    createPostInputValidations: createCreatePostInputValidations(validators),
    updatePostInputValidations: createUpdatePostInputValidations(validators),
    updatePostLikeStatusInputValidations:
      createUpdatePostLikeStatusInputValidations(validators),
  };
};
