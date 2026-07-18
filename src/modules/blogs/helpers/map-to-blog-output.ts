import {
  mapToPaginatedOutput,
  mapToSingleOutput,
} from '@/core/helpers/json-api.mapper';
import {
  PaginatedJsonApiResponse,
  SingleJsonApiResponse,
} from '@/core/types/common';
import { ResourceType } from '@/core/types/resource-type';

import {
  GetBlogOutputModel,
  GetMappedBlogOutputModel,
  TBlogDb,
} from '../models/GetBlogOutputModel';

export const getMappedBlogViewModel = ({
  _id,
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
}: TBlogDb): GetMappedBlogOutputModel => ({
  id: _id.toString(),
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
});

export const mapToBlogOutput = (
  blog: GetMappedBlogOutputModel,
): SingleJsonApiResponse<GetBlogOutputModel> => {
  const { id, ...attributes } = blog;
  return mapToSingleOutput(ResourceType.Blogs, id, attributes);
};

export const mapToBlogListPaginatedOutput = (
  blogs: GetMappedBlogOutputModel[],
  pagination: { page: number; pageSize: number; totalCount: number },
): PaginatedJsonApiResponse<GetBlogOutputModel> => {
  const items = blogs.map(({ id, ...attributes }) => ({ id, attributes }));
  return mapToPaginatedOutput(ResourceType.Blogs, items, pagination);
};
