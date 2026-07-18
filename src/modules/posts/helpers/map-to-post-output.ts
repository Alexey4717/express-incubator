import {
  mapToPaginatedOutput,
  mapToSingleOutput,
} from '@/core/helpers/json-api.mapper';
import {
  PaginatedJsonApiResponse,
  SingleJsonApiResponse,
} from '@/core/types/common';
import { LikeStatus } from '@/core/types/common';
import { ResourceType } from '@/core/types/resource-type';

import {
  ExtendedLikesInfo,
  GetMappedPostOutputModel,
  GetPostOutputModel,
  NewestLikeType,
  TPostDb,
} from '../models/GetPostOutputModel';

type PostLikeContext = {
  myStatus?: LikeStatus;
  newestLikes?: NewestLikeType[];
};

export const getMappedPostViewModel = (
  {
    _id,
    title,
    content,
    shortDescription,
    blogName,
    blogId,
    createdAt,
    likesCount,
    dislikesCount,
  }: TPostDb,
  likeContext?: PostLikeContext,
): GetMappedPostOutputModel => {
  const extendedLikesInfo: ExtendedLikesInfo = {
    likesCount: likesCount ?? 0,
    dislikesCount: dislikesCount ?? 0,
    myStatus: likeContext?.myStatus ?? LikeStatus.None,
    newestLikes: likeContext?.newestLikes ?? [],
  };

  return {
    id: _id.toString(),
    title,
    shortDescription,
    content,
    blogId,
    blogName,
    createdAt,
    extendedLikesInfo,
  };
};

export const mapToPostOutput = (
  post: GetMappedPostOutputModel,
): SingleJsonApiResponse<
  Omit<GetPostOutputModel, 'extendedLikesInfo'> & {
    extendedLikesInfo: GetPostOutputModel['extendedLikesInfo'];
  }
> => {
  const { id, ...attributes } = post;
  return mapToSingleOutput(ResourceType.Posts, id, attributes);
};

export const mapToPostListPaginatedOutput = (
  posts: GetMappedPostOutputModel[],
  pagination: { page: number; pageSize: number; totalCount: number },
): PaginatedJsonApiResponse<
  Omit<GetPostOutputModel, 'extendedLikesInfo'> & {
    extendedLikesInfo: GetPostOutputModel['extendedLikesInfo'];
  }
> => {
  const items = posts.map(({ id, ...attributes }) => ({ id, attributes }));
  return mapToPaginatedOutput(ResourceType.Posts, items, pagination);
};
