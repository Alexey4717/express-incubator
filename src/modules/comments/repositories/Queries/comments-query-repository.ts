import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { calculateAndGetSkipValue } from '@/core/helpers';
import { PaginatedQueryResult, SortDirections } from '@/core/types/common';

import PostModel from '../../../posts/models/Post-model';
import { getMappedCommentViewModel } from '../../helpers/map-to-comment-output';
import CommentModel from '../../models/Comment-model';
import { GetMappedCommentOutputModel } from '../../models/GetCommentOutputModel';
import { GetPostsInputModel } from '../../models/GetPostCommentsInputModel';

type GetPostCommentsQueryArgs = GetPostsInputModel & {
  currentUserId?: string;
};

@injectable()
export class CommentsQueryRepository {
  async getPostComments({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    postId,
    currentUserId,
  }: GetPostCommentsQueryArgs): Promise<PaginatedQueryResult<GetMappedCommentOutputModel> | null> {
    try {
      const foundPost = await PostModel.findOne({
        _id: new ObjectId(postId),
      }).lean();
      if (!foundPost) return null;

      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const filter = { postId };
      const items = await CommentModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await CommentModel.countDocuments(filter);
      return {
        items: items.map((item) =>
          getMappedCommentViewModel({ ...item, currentUserId }),
        ),
        totalCount,
      };
    } catch (error) {
      console.log(
        `CommentsQueryRepository.getPostComments error is occurred: ${error}`,
      );
      return { items: [], totalCount: 0 };
    }
  }

  async getCommentById(
    id: string,
    currentUserId?: string,
  ): Promise<GetMappedCommentOutputModel | null> {
    try {
      const comment = await CommentModel.findOne({
        _id: new ObjectId(id),
      }).lean();
      return comment
        ? getMappedCommentViewModel({ ...comment, currentUserId })
        : null;
    } catch (error) {
      console.log(
        `CommentsQueryRepository.getCommentById error is occurred: ${error}`,
      );
      return null;
    }
  }
}
