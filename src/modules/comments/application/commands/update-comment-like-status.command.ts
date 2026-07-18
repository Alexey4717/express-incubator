import type { LikeStatus } from '@/core/types/common';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly likeStatus: LikeStatus,
  ) {}
}
