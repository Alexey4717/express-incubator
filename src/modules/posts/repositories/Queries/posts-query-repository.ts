import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { calculateAndGetSkipValue } from '@/core/helpers';
import { PaginatedQueryResult, SortDirections } from '@/core/types/common';

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
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean<TPostDb[]>();
      const totalCount = await PostModel.countDocuments(filter);
      return {
        items: items.map((item) =>
          getMappedPostViewModel({ ...item, currentUserId }),
        ),
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
      return foundPost
        ? getMappedPostViewModel({ ...foundPost, currentUserId })
        : null;
    } catch (error) {
      console.log(
        `PostsQueryRepository.findPostById error is occurred: ${error}`,
      );
      return null;
    }
  }
}
