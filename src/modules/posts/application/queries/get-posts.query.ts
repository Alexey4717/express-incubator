import type { GetPostsArgs } from '../../models/GetPostsInputModel';

export class GetPostsQuery {
  constructor(
    public readonly args: GetPostsArgs & { currentUserId?: string },
  ) {}
}
