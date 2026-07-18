import {
  JsonApiResource,
  PaginatedJsonApiResponse,
  SingleJsonApiResponse,
} from '../types/common';
import { ResourceType } from '../types/resource-type';

export const mapToResource = <TAttributes>(
  type: ResourceType,
  id: string,
  attributes: TAttributes,
): JsonApiResource<TAttributes> => ({
  type,
  id,
  attributes,
});

export const mapToSingleOutput = <TAttributes>(
  type: ResourceType,
  id: string,
  attributes: TAttributes,
): SingleJsonApiResponse<TAttributes> => ({
  data: mapToResource(type, id, attributes),
});

type PaginatedOutputArgs = {
  page: number;
  pageSize: number;
  totalCount: number;
};

export const mapToPaginatedOutput = <TAttributes>(
  type: ResourceType,
  items: Array<{ id: string; attributes: TAttributes }>,
  { page, pageSize, totalCount }: PaginatedOutputArgs,
): PaginatedJsonApiResponse<TAttributes> => ({
  meta: {
    page,
    pageSize,
    pageCount: Math.ceil(totalCount / pageSize) || 0,
    totalCount,
  },
  data: items.map(({ id, attributes }) => mapToResource(type, id, attributes)),
});
