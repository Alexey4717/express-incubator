import { PaginatedQueryResult } from '@/core/types/common';

import { GetMappedPostOutputModel } from '../../models/GetPostOutputModel';
import type { GetPostsArgs } from '../../models/GetPostsInputModel';

type GetPostsQueryArgs = GetPostsArgs & {
  currentUserId?: string;
};

export interface IPostsQueryRepository {
  getPosts(
    args: GetPostsQueryArgs,
  ): Promise<PaginatedQueryResult<GetMappedPostOutputModel>>;
  findPostById(
    id: string,
    currentUserId?: string,
  ): Promise<GetMappedPostOutputModel | null>;
}
