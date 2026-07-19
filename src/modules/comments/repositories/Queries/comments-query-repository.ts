import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CORE_TYPES } from '@/core/core.tokens';
import { buildSortQuery, calculateAndGetSkipValue } from '@/core/helpers';
import type { ILikeStatusRepository } from '@/core/repositories/contracts/ILikeStatusRepository';
import { PaginatedQueryResult, SortDirections } from '@/core/types/common';
import { LikeStatus } from '@/core/types/common';

import PostModel from '../../../posts/models/Post-model';
import { getMappedCommentViewModel } from '../../helpers/map-to-comment-output';
import CommentModel from '../../models/Comment-model';
import { GetMappedCommentOutputModel } from '../../models/GetCommentOutputModel';
import { GetPostCommentsInputModel } from '../../models/GetPostCommentsInputModel';
import type { ICommentsQueryRepository } from '../contracts/ICommentsQueryRepository';

type GetPostCommentsQueryArgs = GetPostCommentsInputModel & {
  currentUserId?: string;
};

@injectable()
export class CommentsQueryRepository implements ICommentsQueryRepository {
  constructor(
    @inject(CORE_TYPES.ILikeStatusRepository)
    protected likeStatusRepository: ILikeStatusRepository,
  ) {}

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
        .sort(buildSortQuery(sortBy, sortDirection))
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await CommentModel.countDocuments(filter);
      const commentIds = items.map((item) => item._id.toString());
      const userStatuses = currentUserId
        ? await this.likeStatusRepository.findUserStatuses(
            commentIds,
            currentUserId,
          )
        : null;

      return {
        items: items.map((item) =>
          getMappedCommentViewModel(item, {
            myStatus: userStatuses?.get(item._id.toString()) ?? LikeStatus.None,
          }),
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
      if (!comment) {
        return null;
      }

      const myStatus = currentUserId
        ? await this.likeStatusRepository.findUserStatus(id, currentUserId)
        : LikeStatus.None;

      return getMappedCommentViewModel(comment, { myStatus });
    } catch (error) {
      console.log(
        `CommentsQueryRepository.getCommentById error is occurred: ${error}`,
      );
      return null;
    }
  }
}
