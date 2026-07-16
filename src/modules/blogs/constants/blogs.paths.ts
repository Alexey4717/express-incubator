export const BLOGS_PATH = '/api/blogs' as const;

export const BLOGS_ROUTES = {
  ROOT: '',
  BY_ID: '/:id',
  POSTS: '/:id/posts',
} as const;
