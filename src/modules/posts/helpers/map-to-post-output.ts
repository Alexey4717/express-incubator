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
  TReactions as TReactionsPost,
} from '../models/GetPostOutputModel';

type PostWithUserContext = TPostDb & { currentUserId?: string };

export const getMappedPostViewModel = ({
  _id,
  title,
  content,
  shortDescription,
  blogName,
  blogId,
  createdAt,
  currentUserId,
  reactions,
}: PostWithUserContext): GetMappedPostOutputModel => {
  const extendedLikesInfo =
    reactions?.length > 0
      ? reactions.reduce(
          (result: ExtendedLikesInfo, reaction: TReactionsPost) => {
            if (reaction.likeStatus === LikeStatus.Like) {
              const currentReaction = {
                userId: reaction.userId,
                login: reaction.userLogin,
                addedAt: reaction.createdAt,
              };

              result.newestLikes.push(currentReaction);

              if (result.newestLikes.length > 1) {
                result.newestLikes.sort(
                  (a: NewestLikeType, b: NewestLikeType) => {
                    if (
                      new Date(a.addedAt).valueOf() <
                      new Date(b.addedAt).valueOf()
                    )
                      return 1;
                    if (
                      new Date(a.addedAt).valueOf() ===
                      new Date(b.addedAt).valueOf()
                    )
                      return 0;
                    return -1;
                  },
                );
              }

              if (result.newestLikes.length === 4) {
                result.newestLikes.splice(3, 1);
              }
            }

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
            newestLikes: [],
          },
        )
      : {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
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
