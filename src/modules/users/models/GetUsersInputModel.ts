import { SortDirections } from '@/core/types/common';
import { PaginatedSortQueryParams } from '@/core/types/query-params';

export const SORT_USERS_FIELDS = ['login', 'email', 'createdAt'] as const;

export type SortUsersBy = (typeof SORT_USERS_FIELDS)[number];

export type GetUsersInputModel = {
  /**
   * Set sortBy for sorting users by field in query-params. Default value : createdAt.
   */
  sortBy?: SortUsersBy;

  /**
   * Set sortDirection for sorting users by field and direction in query-params. Default value: desc.
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

  /**
   * Search term for user Login: Login should contains this term in any position. Default value: null.
   */
  searchLoginTerm?: string | null;

  /**
   * Search term for user Email: Email should contains this term in any position. Default value: null.
   */
  searchEmailTerm?: string | null;
};

export type GetUsersArgs = PaginatedSortQueryParams & {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  sortBy: SortUsersBy;
};
