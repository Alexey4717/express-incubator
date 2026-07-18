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
  TUserDb,
} from '../models/GetUserOutputModel';

export const getMappedUserViewModel = ({
  _id,
  accountData,
}: TUserDb): GetMappedUserOutputModel => ({
  id: _id.toString(),
  login: accountData.login,
  email: accountData.email,
  createdAt: accountData.createdAt,
});

export const mapToUserOutput = (
  user: GetMappedUserOutputModel,
): SingleJsonApiResponse<Omit<GetMappedUserOutputModel, 'id'>> => {
  const { id, ...attributes } = user;
  return mapToSingleOutput(ResourceType.Users, id, attributes);
};

export const mapToUserListPaginatedOutput = (
  users: GetMappedUserOutputModel[],
  pagination: { page: number; pageSize: number; totalCount: number },
): PaginatedJsonApiResponse<Omit<GetMappedUserOutputModel, 'id'>> => {
  const items = users.map(({ id, ...attributes }) => ({ id, attributes }));
  return mapToPaginatedOutput(ResourceType.Users, items, pagination);
};
