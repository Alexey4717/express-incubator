import type { GetPostCommentsInputModel } from '../../models/GetPostCommentsInputModel';

export class GetPostCommentsQuery {
  constructor(
    public readonly args: GetPostCommentsInputModel & {
      currentUserId?: string;
    },
  ) {}
}
