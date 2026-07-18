import { ObjectId } from 'mongodb';

import { LikeStatus } from '@/core/types/common';

import { TPostDb } from '../../models/GetPostOutputModel';

interface UpdateLikeStatusPostArgs {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}

type PostUpdateDomain = Pick<
  TPostDb,
  'title' | 'shortDescription' | 'content' | 'blogId'
>;

export interface IPostsRepository {
  getPostById(id: string): Promise<TPostDb | null>;
  createPost(newPost: TPostDb): Promise<ObjectId | null>;
  updatePost(id: string, post: PostUpdateDomain): Promise<boolean>;
  updatePostLikeStatus(args: UpdateLikeStatusPostArgs): Promise<boolean>;
  deletePostById(id: string): Promise<boolean>;
}
