import { model, Schema } from 'mongoose';

import { GetBlogOutputModel } from './GetBlogOutputModel';

const BlogSchema = new Schema<GetBlogOutputModel>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  isMembership: { type: Boolean, default: false },
  createdAt: { type: String, default: new Date().toISOString() },
});

export default model('Blog', BlogSchema);
