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
  GetCommentOutputModel,
  GetMappedCommentOutputModel,
  LikesInfo,
  TCommentDb,
} from '../models/GetCommentOutputModel';

type CommentLikeContext = {
  myStatus?: LikeStatus;
};

export const getMappedCommentViewModel = (
  {
    _id,
    content,
    commentatorInfo,
    createdAt,
    likesCount,
    dislikesCount,
  }: TCommentDb,
  likeContext?: CommentLikeContext,
): GetMappedCommentOutputModel => {
  const { userId, userLogin } = commentatorInfo || {};

  const likesInfo: LikesInfo = {
    likesCount: likesCount ?? 0,
    dislikesCount: dislikesCount ?? 0,
    myStatus: likeContext?.myStatus ?? LikeStatus.None,
  };

  return {
    id: _id?.toString(),
    content,
    commentatorInfo: {
      userId,
      userLogin,
    },
    createdAt,
    likesInfo,
  };
};

export const mapToCommentOutput = (
  comment: GetMappedCommentOutputModel,
): SingleJsonApiResponse<GetCommentOutputModel> => {
  const { id, ...attributes } = comment;
  return mapToSingleOutput(ResourceType.Comments, id, attributes);
};

export const mapToCommentListPaginatedOutput = (
  comments: GetMappedCommentOutputModel[],
  pagination: { page: number; pageSize: number; totalCount: number },
): PaginatedJsonApiResponse<GetCommentOutputModel> => {
  const items = comments.map(({ id, ...attributes }) => ({ id, attributes }));
  return mapToPaginatedOutput(ResourceType.Comments, items, pagination);
};
