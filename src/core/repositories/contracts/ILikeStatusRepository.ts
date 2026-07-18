import type { ParentType } from '../../models/LikeStatus-model';
import { LikeStatus } from '../../types/common';
import type { NewestLikeType } from '../../types/newest-like';

export type LikeCounts = {
  likesCount: number;
  dislikesCount: number;
};

export type UpsertLikeArgs = {
  parentId: string;
  parentType: ParentType;
  userId: string;
  likeStatus: LikeStatus;
  userLogin?: string;
};

export interface ILikeStatusRepository {
  upsertLike(args: UpsertLikeArgs): Promise<void>;
  countByParent(parentId: string): Promise<LikeCounts>;
  findUserStatus(parentId: string, userId: string): Promise<LikeStatus>;
  findUserStatuses(
    parentIds: string[],
    userId: string,
  ): Promise<Map<string, LikeStatus>>;
  findNewestLikes(parentId: string, limit?: number): Promise<NewestLikeType[]>;
}
