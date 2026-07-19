import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CORE_TYPES } from '@/core/core.tokens';
import { buildSortQuery, calculateAndGetSkipValue } from '@/core/helpers';
import type { ILikeStatusRepository } from '@/core/repositories/contracts/ILikeStatusRepository';
import { PaginatedQueryResult, SortDirections } from '@/core/types/common';
import { LikeStatus } from '@/core/types/common';

import { getMappedPostViewModel } from '../../helpers/map-to-post-output';
import {
  GetMappedPostOutputModel,
  TPostDb,
} from '../../models/GetPostOutputModel';
import type { GetPostsArgs } from '../../models/GetPostsInputModel';
import PostModel from '../../models/Post-model';
import type { IPostsQueryRepository } from '../contracts/IPostsQueryRepository';

type GetPostsQueryArgs = GetPostsArgs & {
  currentUserId?: string;
};

@injectable()
export class PostsQueryRepository implements IPostsQueryRepository {
  constructor(
    @inject(CORE_TYPES.ILikeStatusRepository)
    protected likeStatusRepository: ILikeStatusRepository,
  ) {}

  async getPosts({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    currentUserId,
  }: GetPostsQueryArgs): Promise<
    PaginatedQueryResult<GetMappedPostOutputModel>
  > {
    try {
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const filter = {};
      const items = await PostModel.find(filter)
        .sort(buildSortQuery(sortBy, sortDirection))
        .skip(skipValue)
        .limit(pageSize)
        .lean<TPostDb[]>();
      const totalCount = await PostModel.countDocuments(filter);
      const postIds = items.map((item) => item._id.toString());
      const userStatuses = currentUserId
        ? await this.likeStatusRepository.findUserStatuses(
            postIds,
            currentUserId,
          )
        : null;

      const mappedItems = await Promise.all(
        items.map(async (item) => {
          const postId = item._id.toString();
          const newestLikes =
            await this.likeStatusRepository.findNewestLikes(postId);

          return getMappedPostViewModel(item, {
            myStatus: userStatuses?.get(postId) ?? LikeStatus.None,
            newestLikes,
          });
        }),
      );

      return {
        items: mappedItems,
        totalCount,
      };
    } catch (error) {
      console.log(`PostsQueryRepository.getPosts error is occurred: ${error}`);
      return { items: [], totalCount: 0 };
    }
  }

  async findPostById(
    id: string,
    currentUserId?: string,
  ): Promise<GetMappedPostOutputModel | null> {
    try {
      const foundPost = await PostModel.findOne({
        _id: new ObjectId(id),
      }).lean<TPostDb>();
      if (!foundPost) {
        return null;
      }

      const myStatus = currentUserId
        ? await this.likeStatusRepository.findUserStatus(id, currentUserId)
        : LikeStatus.None;
      const newestLikes = await this.likeStatusRepository.findNewestLikes(id);

      return getMappedPostViewModel(foundPost, { myStatus, newestLikes });
    } catch (error) {
      console.log(
        `PostsQueryRepository.findPostById error is occurred: ${error}`,
      );
      return null;
    }
  }
}
