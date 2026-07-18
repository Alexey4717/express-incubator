import type { ParentType, TLikeStatusDb } from '../../models/LikeStatus-model';
import { LikeStatus } from '../../types/common';

export type LikeStatusUpsertInput = {
  existing: TLikeStatusDb | null;
  parentId: string;
  parentType: ParentType;
  userId: string;
  userLogin?: string;
  likeStatus: LikeStatus;
};

export type LikeStatusUpsertAction =
  | { type: 'noop' }
  | { type: 'delete' }
  | {
      type: 'create';
      record: Omit<TLikeStatusDb, 'createdAt'> & { createdAt: string };
    }
  | {
      type: 'update';
      likeStatus: LikeStatus;
      createdAt: string;
      userLogin?: string;
    };

export class LikeStatusEntity {
  static resolveUpsert(input: LikeStatusUpsertInput): LikeStatusUpsertAction {
    const { existing, likeStatus, parentId, parentType, userId, userLogin } =
      input;

    if (likeStatus === LikeStatus.None) {
      return existing ? { type: 'delete' } : { type: 'noop' };
    }

    if (!existing) {
      return {
        type: 'create',
        record: {
          parentId,
          parentType,
          userId,
          userLogin,
          likeStatus,
          createdAt: new Date().toISOString(),
        },
      };
    }

    if (existing.likeStatus === likeStatus) {
      return { type: 'noop' };
    }

    return {
      type: 'update',
      likeStatus,
      createdAt: new Date().toISOString(),
      ...(userLogin !== undefined ? { userLogin } : {}),
    };
  }
}
