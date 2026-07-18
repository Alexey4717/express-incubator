import { model, Schema } from 'mongoose';

import { LikeStatus } from '../types/common';

export type ParentType = 'comment' | 'post';

export type TLikeStatusDb = {
  parentId: string;
  parentType: ParentType;
  userId: string;
  userLogin?: string;
  likeStatus: LikeStatus;
  createdAt: string;
};

const LikeStatusSchema = new Schema<TLikeStatusDb>({
  parentId: { type: String, required: true },
  parentType: { type: String, enum: ['comment', 'post'], required: true },
  userId: { type: String, required: true },
  userLogin: { type: String },
  likeStatus: { type: String, enum: LikeStatus, required: true },
  createdAt: {
    type: String,
    required: true,
    default: () => new Date().toISOString(),
  },
});

LikeStatusSchema.index({ parentId: 1, userId: 1 }, { unique: true });
LikeStatusSchema.index({ parentId: 1, likeStatus: 1 });

export default model('LikeStatus', LikeStatusSchema);
