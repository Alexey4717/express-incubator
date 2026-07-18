import type { GetPostsInBlogArgs } from '../../models/GetPostsInBlogArgs';

export class GetPostsInBlogQuery {
  constructor(
    public readonly blogId: string,
    public readonly args: GetPostsInBlogArgs & { currentUserId?: string },
  ) {}
}
