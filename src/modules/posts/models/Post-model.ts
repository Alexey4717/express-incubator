import { model, Schema } from 'mongoose';

import { TPostDb } from './GetPostOutputModel';

const PostSchema = new Schema<TPostDb>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  likesCount: { type: Number, required: true, default: 0 },
  dislikesCount: { type: Number, required: true, default: 0 },
});

export default model('Post', PostSchema);
