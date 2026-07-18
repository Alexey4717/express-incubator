import { ObjectId } from 'mongodb';

import LikeStatusModel, { ParentType } from '@/core/models/LikeStatus-model';
import { LikeStatus } from '@/core/types/common';

import CommentModel from '../../comments/models/Comment-model';
import PostModel from '../../posts/models/Post-model';

type LegacyReaction = {
  userId: string;
  userLogin?: string;
  likeStatus: LikeStatus;
  createdAt: string;
};

type LegacyComment = {
  _id: ObjectId;
  reactions?: LegacyReaction[];
};

type LegacyPost = {
  _id: ObjectId;
  reactions?: LegacyReaction[];
};

const migrateReactionsForParent = async ({
  parentId,
  parentType,
  reactions,
}: {
  parentId: string;
  parentType: ParentType;
  reactions: LegacyReaction[];
}) => {
  let likesCount = 0;
  let dislikesCount = 0;

  for (const reaction of reactions) {
    if (reaction.likeStatus === LikeStatus.None) {
      continue;
    }

    if (reaction.likeStatus === LikeStatus.Like) {
      likesCount += 1;
    }
    if (reaction.likeStatus === LikeStatus.Dislike) {
      dislikesCount += 1;
    }

    await LikeStatusModel.updateOne(
      { parentId, userId: reaction.userId },
      {
        $set: {
          parentId,
          parentType,
          userId: reaction.userId,
          userLogin: reaction.userLogin,
          likeStatus: reaction.likeStatus,
          createdAt: reaction.createdAt,
        },
      },
      { upsert: true },
    );
  }

  return { likesCount, dislikesCount };
};

export const migrateReactionsToLikes = async (): Promise<void> => {
  const comments = (await CommentModel.find({
    reactions: { $exists: true, $ne: [] },
  }).lean()) as LegacyComment[];

  for (const comment of comments) {
    const parentId = comment._id.toString();
    const counts = await migrateReactionsForParent({
      parentId,
      parentType: 'comment',
      reactions: comment.reactions ?? [],
    });

    await CommentModel.updateOne(
      { _id: comment._id },
      {
        $set: {
          likesCount: counts.likesCount,
          dislikesCount: counts.dislikesCount,
        },
        $unset: { reactions: '' },
      },
    );
  }

  const posts = (await PostModel.find({
    reactions: { $exists: true, $ne: [] },
  }).lean()) as LegacyPost[];

  for (const post of posts) {
    const parentId = post._id.toString();
    const counts = await migrateReactionsForParent({
      parentId,
      parentType: 'post',
      reactions: post.reactions ?? [],
    });

    await PostModel.updateOne(
      { _id: post._id },
      {
        $set: {
          likesCount: counts.likesCount,
          dislikesCount: counts.dislikesCount,
        },
        $unset: { reactions: '' },
      },
    );
  }
};
