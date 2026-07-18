import { ObjectId } from 'mongodb';

import type { TPostDb } from '../../../posts/models/GetPostOutputModel';
import { GetBlogOutputModel, TBlogDb } from '../../models/GetBlogOutputModel';

type BlogUpdateDomain = Pick<
  GetBlogOutputModel,
  'name' | 'description' | 'websiteUrl'
>;

export interface IBlogsRepository {
  getBlogById(id: string): Promise<TBlogDb | null>;
  createBlog(newBlog: GetBlogOutputModel): Promise<ObjectId | null>;
  createPostInBlog(newPost: TPostDb): Promise<ObjectId | null>;
  updateBlog(id: string, blog: BlogUpdateDomain): Promise<boolean>;
  deleteBlogById(id: string): Promise<boolean>;
}
