import { SortDirections } from './common';

export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORT_BY = 'createdAt';

export type PaginatedSortQueryParams = {
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};

/** Analogous to BaseQueryParams from the lecture codebase. */
export type BaseQueryParams = PaginatedSortQueryParams;

export type PaginatedListQuery<
  TSortBy extends string,
  TFilters = object,
> = BaseQueryParams & {
  sortBy: TSortBy;
} & TFilters;
