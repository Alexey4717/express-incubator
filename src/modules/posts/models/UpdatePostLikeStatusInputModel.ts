import { LikeStatus } from '@/core/types/common';

export type UpdatePostLikeStatusInputModel = {
  /**
   * Update likeStatus of post. Required.
   */
  likeStatus: LikeStatus;
};
