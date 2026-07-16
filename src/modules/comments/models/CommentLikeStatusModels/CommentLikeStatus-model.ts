import { model, Schema } from 'mongoose';

import { LikeStatus } from '../../../../core/types/common';
import { GetCommentLikeStatusOutputModel } from './GetCommentLikeStatusOutputModel';

export const CommentLikeStatusSchema =
  new Schema<GetCommentLikeStatusOutputModel>({
    commentId: { type: String, required: true },
    userId: { type: String, required: true },
    likeStatus: { type: String, enum: LikeStatus },
    createdAt: { type: String, default: new Date().toISOString() },
  });

export default model('commentLikeStatus', CommentLikeStatusSchema);
