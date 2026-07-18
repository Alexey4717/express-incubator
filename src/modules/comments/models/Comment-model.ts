import { model, Schema } from 'mongoose';

import { TCommentDb } from './GetCommentOutputModel';

const CommentSchema = new Schema<TCommentDb>({
  postId: { type: String, required: true },
  content: { type: String, required: true, min: 20, max: 300 },
  commentatorInfo: {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
  likesCount: { type: Number, required: true, default: 0 },
  dislikesCount: { type: Number, required: true, default: 0 },
});

export default model('Comment', CommentSchema);
