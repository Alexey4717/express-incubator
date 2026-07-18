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
  GetMappedUserOutputModel,
  GetUserOutputModelFromMongoDB,
} from '../models/GetUserOutputModel';

export const getMappedUserViewModel = ({
  _id,
  accountData,
}: GetUserOutputModelFromMongoDB): GetMappedUserOutputModel => ({
  id: _id.toString(),
  login: accountData.login,
  email: accountData.email,
  createdAt: accountData.createdAt,
});

const toUserResourceParts = (user: GetUserOutputModelFromMongoDB) => {
  const { id, ...attributes } = getMappedUserViewModel(user);
  return { id, attributes };
};

export const mapToUserOutput = (
  user: GetUserOutputModelFromMongoDB,
): SingleJsonApiResponse<Omit<GetMappedUserOutputModel, 'id'>> => {
  const { id, attributes } = toUserResourceParts(user);
  return mapToSingleOutput(ResourceType.Users, id, attributes);
};

export const mapToUserListPaginatedOutput = (
  users: GetUserOutputModelFromMongoDB[],
  pagination: { page: number; pageSize: number; totalCount: number },
): PaginatedJsonApiResponse<Omit<GetMappedUserOutputModel, 'id'>> => {
  const items = users.map(toUserResourceParts);
  return mapToPaginatedOutput(ResourceType.Users, items, pagination);
};
