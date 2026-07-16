export const COMMENTS_PATH = '/api/comments' as const;

export const COMMENTS_ROUTES = {
  BY_ID: '/:id',
  BY_COMMENT_ID: '/:commentId',
  LIKE_STATUS: '/:commentId/like-status',
} as const;
