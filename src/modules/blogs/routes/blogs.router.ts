import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import {
  blogsSearchValidation,
  paginationAndSortingValidation,
} from '@/core/middlewares/query-pagination-sorting.validation.middleware';
import { mongoIdParamValidation } from '@/core/validations/common';

import { SORT_POSTS_FIELDS } from '../../posts/models/GetPostsInputModel';
import { BLOGS_ROUTES } from '../constants/blogs.paths';
import { BlogControllers } from '../controllers/blog-controllers';
import { SORT_BLOGS_FIELDS } from '../models/GetBlogsInputModel';
import { createBlogInputValidations } from '../validations/createBlogInputValidations';
import { createPostInBlogInputValidations } from '../validations/createPostInBlogInputValidations';
import { updateBlogInputValidations } from '../validations/updateBlogInputValidations';

export type BlogsRouterDeps = {
  blogControllers: BlogControllers;
  setUserDataMiddleware: RequestHandler;
  adminBasicAuthMiddleware: RequestHandler;
  createPostInBlogInputValidations: ReturnType<
    typeof createPostInBlogInputValidations
  >;
};

export const createBlogsRouter = ({
  blogControllers,
  setUserDataMiddleware,
  adminBasicAuthMiddleware,
  createPostInBlogInputValidations,
}: BlogsRouterDeps) => {
  const router = Router({});

  router.get(
    BLOGS_ROUTES.ROOT,
    ...paginationAndSortingValidation(SORT_BLOGS_FIELDS),
    ...blogsSearchValidation(),
    inputValidationsMiddleware,
    blogControllers.getBlogs.bind(blogControllers),
  );
  router.get(
    BLOGS_ROUTES.BY_ID,
    mongoIdParamValidation('id'),
    inputValidationsMiddleware,
    blogControllers.getBlog.bind(blogControllers),
  );
  router.get(
    BLOGS_ROUTES.POSTS,
    mongoIdParamValidation('id'),
    setUserDataMiddleware,
    ...paginationAndSortingValidation(SORT_POSTS_FIELDS),
    inputValidationsMiddleware,
    blogControllers.getPostsOfBlog.bind(blogControllers),
  );

  router.post(
    BLOGS_ROUTES.ROOT,
    adminBasicAuthMiddleware,
    createBlogInputValidations,
    inputValidationsMiddleware,
    blogControllers.createBlog.bind(blogControllers),
  );
  router.post(
    BLOGS_ROUTES.POSTS,
    adminBasicAuthMiddleware,
    mongoIdParamValidation('id'),
    setUserDataMiddleware,
    createPostInBlogInputValidations,
    inputValidationsMiddleware,
    blogControllers.createPostInBlog.bind(blogControllers),
  );

  router.put(
    BLOGS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    mongoIdParamValidation('id'),
    updateBlogInputValidations,
    inputValidationsMiddleware,
    blogControllers.updateBlog.bind(blogControllers),
  );

  router.delete(
    BLOGS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    mongoIdParamValidation('id'),
    inputValidationsMiddleware,
    blogControllers.deleteBlog.bind(blogControllers),
  );

  return router;
};
