import type { LikeStatus } from '@/core/types/common';

export class UpdatePostLikeStatusCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly likeStatus: LikeStatus,
  ) {}
}
