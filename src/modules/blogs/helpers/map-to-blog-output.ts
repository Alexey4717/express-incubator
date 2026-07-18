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
  GetBlogOutputModelFromMongoDB,
  GetMappedBlogOutputModel,
} from '../models/GetBlogOutputModel';

export const getMappedBlogViewModel = ({
  _id,
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
}: GetBlogOutputModelFromMongoDB): GetMappedBlogOutputModel => ({
  id: _id.toString(),
  name,
  description,
  websiteUrl,
  isMembership,
  createdAt,
});

const toBlogResourceParts = (blog: GetBlogOutputModelFromMongoDB) => {
  const { id, ...attributes } = getMappedBlogViewModel(blog);
  return { id, attributes };
};

export const mapToBlogOutput = (
  blog: GetBlogOutputModelFromMongoDB,
): SingleJsonApiResponse<GetBlogOutputModel> => {
  const { id, attributes } = toBlogResourceParts(blog);
  return mapToSingleOutput(ResourceType.Blogs, id, attributes);
};

export const mapToBlogListPaginatedOutput = (
  blogs: GetBlogOutputModelFromMongoDB[],
  pagination: { page: number; pageSize: number; totalCount: number },
): PaginatedJsonApiResponse<GetBlogOutputModel> => {
  const items = blogs.map(toBlogResourceParts);
  return mapToPaginatedOutput(ResourceType.Blogs, items, pagination);
};
