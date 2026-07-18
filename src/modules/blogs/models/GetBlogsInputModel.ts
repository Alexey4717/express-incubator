import { SortDirections } from '@/core/types/common';
import { PaginatedSortQueryParams } from '@/core/types/query-params';

export const SORT_BLOGS_FIELDS = [
  'name',
  'description',
  'websiteUrl',
  'createdAt',
] as const;

export type SortBlogsBy = (typeof SORT_BLOGS_FIELDS)[number];

export type GetBlogsInputModel = {
  /**
   * Set term for search blogs by searchNameTerm in query-params. Default value : null.
   */
  searchNameTerm?: string | null;

  /**
   * Set sortBy for sorting blogs by field in query-params. Default value : createdAt.
   */
  sortBy?: SortBlogsBy;

  /**
   * Set sortDirection for sorting blogs by field and direction in query-params. Default value: desc.
   */
  sortDirection?: SortDirections;

  /**
   * PageNumber is number of portions that should be returned. Default value : 1.
   */
  pageNumber?: number;

  /**
   * PageSize is portions size that should be returned. Default value : 10.
   */
  pageSize?: number;
};

export type GetBlogsArgs = PaginatedSortQueryParams & {
  searchNameTerm: string | null;
  sortBy: SortBlogsBy;
};
