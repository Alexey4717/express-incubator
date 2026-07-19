import { SortDirections } from '@/core/types/common';

export const SORT_POST_COMMENTS_FIELDS = ['content', 'createdAt'] as const;

export type SortPostCommentsBy = (typeof SORT_POST_COMMENTS_FIELDS)[number];

export type GetPostCommentsInputModel = {
  /**
   * Set sortBy for sorting post comments by field in query-params. Default value: createdAt.
   */
  sortBy: SortPostCommentsBy;

  /**
   * Set sortDirection for sorting post comments by direction in query-params. Default value: desc.
   */
  sortDirection: SortDirections;

  /**
   * PageNumber is number of portions that should be returned. Default value : 1.
   */
  pageNumber: number;

  /**
   * PageSize is portions size that should be returned. Default value : 10.
   */
  pageSize: number;

  /**
   * Id of post that contain comments.
   */
  postId: string;
};
