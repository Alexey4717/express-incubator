import { ObjectId } from 'mongodb';

import { TPostDb } from '../../models/GetPostOutputModel';

type PostUpdateDomain = Pick<
  TPostDb,
  'title' | 'shortDescription' | 'content' | 'blogId'
>;

export interface IPostsRepository {
  getPostById(id: string): Promise<TPostDb | null>;
  createPost(newPost: TPostDb): Promise<ObjectId | null>;
  updatePost(id: string, post: PostUpdateDomain): Promise<boolean>;
  updateLikeCounts(
    postId: string,
    counts: { likesCount: number; dislikesCount: number },
  ): Promise<boolean>;
  deletePostById(id: string): Promise<boolean>;
}
