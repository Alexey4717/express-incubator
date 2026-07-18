import { SortDirections } from './common';

export type PaginatedSortQueryParams = {
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};
