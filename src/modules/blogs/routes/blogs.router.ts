import { RequestHandler, Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '@/core/middlewares/paramId-validation-middleware';

import { BLOGS_ROUTES } from '../constants/blogs.paths';
import { BlogControllers } from '../controllers/blog-controllers';
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

  router.get(BLOGS_ROUTES.ROOT, blogControllers.getBlogs.bind(blogControllers));
  router.get(
    BLOGS_ROUTES.BY_ID,
    paramIdValidationMiddleware,
    inputValidationsMiddleware,
    blogControllers.getBlog.bind(blogControllers),
  );
  router.get(
    BLOGS_ROUTES.POSTS,
    paramIdValidationMiddleware,
    setUserDataMiddleware,
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
    paramIdValidationMiddleware,
    setUserDataMiddleware,
    createPostInBlogInputValidations,
    inputValidationsMiddleware,
    blogControllers.createPostInBlog.bind(blogControllers),
  );

  router.put(
    BLOGS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    paramIdValidationMiddleware,
    updateBlogInputValidations,
    inputValidationsMiddleware,
    blogControllers.updateBlog.bind(blogControllers),
  );

  router.delete(
    BLOGS_ROUTES.BY_ID,
    adminBasicAuthMiddleware,
    paramIdValidationMiddleware,
    inputValidationsMiddleware,
    blogControllers.deleteBlog.bind(blogControllers),
  );

  return router;
};
