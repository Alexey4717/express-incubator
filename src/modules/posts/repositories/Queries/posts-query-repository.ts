import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { calculateAndGetSkipValue } from '@/core/helpers';
import { GetPostsArgs, Paginator, SortDirections } from '@/core/types/common';

import { TPostDb } from '../../models/GetPostOutputModel';
import PostModel from '../../models/Post-model';

@injectable()
export class PostsQueryRepository {
  async getPosts({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetPostsArgs): Promise<Paginator<TPostDb[]>> {
    try {
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const filter = {};
      const items = await PostModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await PostModel.countDocuments(filter);
      const pagesCount = Math.ceil(totalCount / pageSize);
      return {
        page: pageNumber,
        pageSize,
        totalCount,
        pagesCount,
        items,
      };
    } catch (error) {
      console.log(`PostsQueryRepository.getPosts error is occurred: ${error}`);
      return {} as Paginator<TPostDb[]>;
    }
  }

  async findPostById(id: string): Promise<TPostDb | null> {
    try {
      const foundPost = await PostModel.findOne({
        _id: new ObjectId(id),
      }).lean();
      return foundPost ?? null;
    } catch (error) {
      console.log(
        `PostsQueryRepository.findPostById error is occurred: ${error}`,
      );
      return null;
    }
  }
}
