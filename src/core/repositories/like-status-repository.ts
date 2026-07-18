import { injectable } from 'inversify';

import { LikeStatusEntity } from '../domain/entities/like-status.entity';
import LikeStatusModel from '../models/LikeStatus-model';
import { LikeStatus } from '../types/common';
import type { NewestLikeType } from '../types/newest-like';
import type {
  ILikeStatusRepository,
  LikeCounts,
  UpsertLikeArgs,
} from './contracts/ILikeStatusRepository';

@injectable()
export class LikeStatusRepository implements ILikeStatusRepository {
  async upsertLike({
    parentId,
    parentType,
    userId,
    likeStatus,
    userLogin,
  }: UpsertLikeArgs): Promise<void> {
    try {
      const existing = await LikeStatusModel.findOne({
        parentId,
        userId,
      }).lean();

      const action = LikeStatusEntity.resolveUpsert({
        existing,
        parentId,
        parentType,
        userId,
        userLogin,
        likeStatus,
      });

      switch (action.type) {
        case 'noop':
          return;
        case 'delete':
          await LikeStatusModel.deleteOne({ parentId, userId });
          return;
        case 'create':
          await LikeStatusModel.create(action.record);
          return;
        case 'update':
          await LikeStatusModel.updateOne(
            { parentId, userId },
            {
              $set: {
                likeStatus: action.likeStatus,
                createdAt: action.createdAt,
                ...(action.userLogin !== undefined
                  ? { userLogin: action.userLogin }
                  : {}),
              },
            },
          );
          return;
      }
    } catch (error) {
      console.log(
        `LikeStatusRepository.upsertLike error is occurred: ${error}`,
      );
      throw error;
    }
  }

  async countByParent(parentId: string): Promise<LikeCounts> {
    try {
      const grouped = await LikeStatusModel.aggregate<{
        _id: LikeStatus;
        count: number;
      }>([
        { $match: { parentId } },
        { $group: { _id: '$likeStatus', count: { $sum: 1 } } },
      ]);

      return grouped.reduce<LikeCounts>(
        (counts, { _id, count }) => {
          if (_id === LikeStatus.Like) counts.likesCount = count;
          if (_id === LikeStatus.Dislike) counts.dislikesCount = count;
          return counts;
        },
        { likesCount: 0, dislikesCount: 0 },
      );
    } catch (error) {
      console.log(
        `LikeStatusRepository.countByParent error is occurred: ${error}`,
      );
      return { likesCount: 0, dislikesCount: 0 };
    }
  }

  async findUserStatus(parentId: string, userId: string): Promise<LikeStatus> {
    try {
      const found = await LikeStatusModel.findOne({ parentId, userId }).lean();
      return found?.likeStatus ?? LikeStatus.None;
    } catch (error) {
      console.log(
        `LikeStatusRepository.findUserStatus error is occurred: ${error}`,
      );
      return LikeStatus.None;
    }
  }

  async findUserStatuses(
    parentIds: string[],
    userId: string,
  ): Promise<Map<string, LikeStatus>> {
    const statuses = new Map<string, LikeStatus>(
      parentIds.map((parentId) => [parentId, LikeStatus.None]),
    );

    if (parentIds.length === 0) {
      return statuses;
    }

    try {
      const found = await LikeStatusModel.find({
        parentId: { $in: parentIds },
        userId,
      }).lean();

      for (const item of found) {
        statuses.set(item.parentId, item.likeStatus);
      }
    } catch (error) {
      console.log(
        `LikeStatusRepository.findUserStatuses error is occurred: ${error}`,
      );
    }

    return statuses;
  }

  async findNewestLikes(
    parentId: string,
    limit = 3,
  ): Promise<NewestLikeType[]> {
    try {
      const found = await LikeStatusModel.find({
        parentId,
        likeStatus: LikeStatus.Like,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return found.map((item) => ({
        userId: item.userId,
        login: item.userLogin ?? '',
        addedAt: item.createdAt,
      }));
    } catch (error) {
      console.log(
        `LikeStatusRepository.findNewestLikes error is occurred: ${error}`,
      );
      return [];
    }
  }
}
