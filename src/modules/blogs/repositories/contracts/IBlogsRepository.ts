import { ObjectId } from 'mongodb';

import { BlogEntity, BlogUpdateProps } from '../../domain/entities/blog.entity';
import type { TBlogDb } from '../../models/GetBlogOutputModel';

export interface IBlogsRepository {
  getBlogById(id: string): Promise<TBlogDb | null>;
  createBlog(blog: BlogEntity): Promise<ObjectId | null>;
  save(blog: BlogEntity): Promise<boolean>;
  deleteBlogById(id: string): Promise<boolean>;
}

export type { BlogUpdateProps };
