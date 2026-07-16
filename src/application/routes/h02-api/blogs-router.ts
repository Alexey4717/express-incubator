import { Router } from 'express';

import { blogControllers } from '../../../controllers/blog-controllers';
import { adminBasicAuthMiddleware } from '../../../middlewares/admin-basicAuth-middleware';
import { inputValidationsMiddleware } from '../../../middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../middlewares/paramId-validation-middleware';
import { setUserDataMiddleware } from '../../../middlewares/set-user-data-middleware';
import { createBlogInputValidations } from '../../../validations/blog/createBlogInputValidations';
import { createPostInBlogInputValidations } from '../../../validations/blog/createPostInBlogInputValidations';
import { updateBlogInputValidations } from '../../../validations/blog/updateBlogInputValidations';

export const blogsRouter = Router({});

blogsRouter.get('/', blogControllers.getBlogs);
blogsRouter.get(
  '/:id',
  paramIdValidationMiddleware,
  inputValidationsMiddleware,
  blogControllers.getBlog,
);
blogsRouter.get(
  '/:id/posts',
  paramIdValidationMiddleware,
  setUserDataMiddleware,
  blogControllers.getPostsOfBlog,
);

blogsRouter.post(
  '/',
  adminBasicAuthMiddleware,
  createBlogInputValidations,
  inputValidationsMiddleware,
  blogControllers.createBlog,
);
blogsRouter.post(
  '/:id/posts',
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  setUserDataMiddleware,
  createPostInBlogInputValidations,
  inputValidationsMiddleware,
  blogControllers.createPostInBlog,
);

blogsRouter.put(
  '/:id',
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  updateBlogInputValidations,
  inputValidationsMiddleware,
  blogControllers.updateBlog,
);

blogsRouter.delete(
  '/:id',
  adminBasicAuthMiddleware,
  paramIdValidationMiddleware,
  inputValidationsMiddleware,
  blogControllers.deleteBlog,
);
