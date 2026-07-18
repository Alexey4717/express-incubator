import type { GetPostsInputModel } from '../../models/GetPostCommentsInputModel';

export class GetPostCommentsQuery {
  constructor(
    public readonly args: GetPostsInputModel & { currentUserId?: string },
  ) {}
}
