import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { calculateAndGetSkipValue } from '@/core/helpers';
import { PaginatedQueryResult, SortDirections } from '@/core/types/common';

import { PostsQueryRepository } from '../../../posts/repositories/Queries/posts-query-repository';
import CommentModel from '../../models/Comment-model';
import { TCommentDb } from '../../models/GetCommentOutputModel';
import { GetPostsInputModel } from '../../models/GetPostCommentsInputModel';

@injectable()
export class CommentsQueryRepository {
  constructor(protected postsQueryRepository: PostsQueryRepository) {}

  async getPostComments({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    postId,
  }: GetPostsInputModel): Promise<PaginatedQueryResult<TCommentDb> | null> {
    try {
      const foundPost = await this.postsQueryRepository.findPostById(postId);
      if (!foundPost) return null;

      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const filter = { postId };
      const items = await CommentModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await CommentModel.countDocuments(filter);
      return { items, totalCount };
    } catch (error) {
      console.log(
        `CommentsQueryRepository.getPostComments error is occurred: ${error}`,
      );
      return { items: [], totalCount: 0 };
    }
  }

  async getCommentById(id: string): Promise<TCommentDb | null> {
    try {
      return await CommentModel.findOne({ _id: new ObjectId(id) }).lean();
    } catch (error) {
      console.log(
        `CommentsQueryRepository.getCommentById error is occurred: ${error}`,
      );
      return null;
    }
  }
}
