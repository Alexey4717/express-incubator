import { Router } from 'express';

import { blogControllers } from '../../../app/composition-root';
import { adminBasicAuthMiddleware } from '../../../core/middlewares/admin-basicAuth-middleware';
import { inputValidationsMiddleware } from '../../../core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../core/middlewares/paramId-validation-middleware';
import { setUserDataMiddleware } from '../../../core/middlewares/set-user-data-middleware';
import { BLOGS_ROUTES } from '../constants/blogs.paths';
import { createBlogInputValidations } from '../validations/blog/createBlogInputValidations';
import { createPostInBlogInputValidations } from '../validations/blog/createPostInBlogInputValidations';
import { updateBlogInputValidations } from '../validations/blog/updateBlogInputValidations';

export const blogsRouter = Router({});

blogsRouter.get(
  BLOGS_ROUTES.ROOT,
  blogControllers.getBlogs.bind(blogControllers),
);
blogsRouter.get(
  BLOGS_ROUTES.BY_ID,
  paramIdValidationMiddleware,
  inputValidationsMiddleware,
  blogControllers.getBlog.bind(blogControllers),
);
blogsRouter.get(
  BLOGS_ROUTES.POSTS,
  paramIdValidationMiddleware,
  setUserDataMiddleware,
  blogControllers.getPostsOfBlog.bind(blogControllers),
);

blogsRouter.post(
  BLOGS_ROUTES.ROOT,
  adminBasicAuthMiddleware,
  createBlogInputValidations,
  inputValidationsMiddleware,
  blogControllers.createBlog.bind(blogControllers),
);
blogsRouter.post(
  BLOGS_ROUTES.POSTS,
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  setUserDataMiddleware,
  createPostInBlogInputValidations,
  inputValidationsMiddleware,
  blogControllers.createPostInBlog.bind(blogControllers),
);

blogsRouter.put(
  BLOGS_ROUTES.BY_ID,
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  updateBlogInputValidations,
  inputValidationsMiddleware,
  blogControllers.updateBlog.bind(blogControllers),
);

blogsRouter.delete(
  BLOGS_ROUTES.BY_ID,
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  inputValidationsMiddleware,
  blogControllers.deleteBlog.bind(blogControllers),
);
