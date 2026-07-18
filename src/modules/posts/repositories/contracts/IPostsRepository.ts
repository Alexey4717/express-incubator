import { ObjectId } from 'mongodb';

import { PostEntity, PostUpdateProps } from '../../domain/entities/post.entity';

export interface IPostsRepository {
  getPostById(id: string): Promise<PostEntity | null>;
  createPost(post: PostEntity): Promise<ObjectId | null>;
  save(post: PostEntity): Promise<boolean>;
  deletePostById(id: string): Promise<boolean>;
}

export type { PostUpdateProps };
