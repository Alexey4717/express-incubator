import { PaginatedQueryResult } from '@/core/types/common';

import { GetMappedPostOutputModel } from '../../../posts/models/GetPostOutputModel';
import { GetMappedBlogOutputModel } from '../../models/GetBlogOutputModel';
import type { GetBlogsArgs } from '../../models/GetBlogsInputModel';
import type { GetPostsInBlogArgs } from '../../models/GetPostsInBlogArgs';

type GetPostsInBlogQueryArgs = GetPostsInBlogArgs & {
  currentUserId?: string;
};

export interface IBlogsQueryRepository {
  getBlogs(
    args: GetBlogsArgs,
  ): Promise<PaginatedQueryResult<GetMappedBlogOutputModel>>;
  getPostsInBlog(
    args: GetPostsInBlogQueryArgs,
  ): Promise<PaginatedQueryResult<GetMappedPostOutputModel> | null>;
  findBlogById(id: string): Promise<GetMappedBlogOutputModel | null>;
}
