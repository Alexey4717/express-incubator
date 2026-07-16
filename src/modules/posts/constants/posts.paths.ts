export const POSTS_PATH = '/api/posts' as const;

export const POSTS_ROUTES = {
  ROOT: '',
  BY_ID: '/:id',
  COMMENTS: '/:postId/comments',
  LIKE_STATUS: '/:postId/like-status',
} as const;
