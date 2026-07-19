import { PaginatedQueryResult } from '@/core/types/common';

import { GetMappedCommentOutputModel } from '../../models/GetCommentOutputModel';
import { GetPostCommentsInputModel } from '../../models/GetPostCommentsInputModel';

type GetPostCommentsQueryArgs = GetPostCommentsInputModel & {
  currentUserId?: string;
};

export interface ICommentsQueryRepository {
  getPostComments(
    args: GetPostCommentsQueryArgs,
  ): Promise<PaginatedQueryResult<GetMappedCommentOutputModel> | null>;
  getCommentById(
    id: string,
    currentUserId?: string,
  ): Promise<GetMappedCommentOutputModel | null>;
}
