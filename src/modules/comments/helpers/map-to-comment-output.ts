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
  TReactions as TReactionsComment,
} from '../models/GetCommentOutputModel';

type CommentWithUserContext = TCommentDb & { currentUserId?: string };

export const getMappedCommentViewModel = ({
  _id,
  content,
  commentatorInfo,
  createdAt,
  reactions,
  currentUserId,
}: CommentWithUserContext): GetMappedCommentOutputModel => {
  const { userId, userLogin } = commentatorInfo || {};

  const likesInfo =
    reactions?.length > 0
      ? reactions.reduce(
          (result: LikesInfo, reaction: TReactionsComment) => {
            if (reaction.likeStatus === LikeStatus.Like) result.likesCount += 1;
            if (reaction.likeStatus === LikeStatus.Dislike)
              result.dislikesCount += 1;
            if (reaction.userId === currentUserId) {
              result.myStatus = reaction.likeStatus;
            }
            return result;
          },
          {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
          },
        )
      : {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
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

const toCommentResourceParts = (comment: CommentWithUserContext) => {
  const { id, ...attributes } = getMappedCommentViewModel(comment);
  return { id, attributes };
};

export const mapToCommentOutput = (
  comment: CommentWithUserContext,
): SingleJsonApiResponse<GetCommentOutputModel> => {
  const { id, attributes } = toCommentResourceParts(comment);
  return mapToSingleOutput(ResourceType.Comments, id, attributes);
};

export const mapToCommentListPaginatedOutput = (
  comments: CommentWithUserContext[],
  pagination: { page: number; pageSize: number; totalCount: number },
): PaginatedJsonApiResponse<GetCommentOutputModel> => {
  const items = comments.map(toCommentResourceParts);
  return mapToPaginatedOutput(ResourceType.Comments, items, pagination);
};
