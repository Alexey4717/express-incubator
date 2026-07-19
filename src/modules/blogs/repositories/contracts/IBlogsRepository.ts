import { ObjectId } from 'mongodb';

import { BlogEntity, BlogUpdateProps } from '../../domain/entities/blog.entity';

export interface IBlogsRepository {
  getBlogById(id: string): Promise<BlogEntity | null>;
  createBlog(blog: BlogEntity): Promise<ObjectId | null>;
  save(blog: BlogEntity): Promise<boolean>;
  deleteBlogById(id: string): Promise<boolean>;
}

export type { BlogUpdateProps };
