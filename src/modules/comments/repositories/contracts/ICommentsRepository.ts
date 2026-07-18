import { ObjectId } from 'mongodb';

import { TCommentDb } from '../../models/GetCommentOutputModel';

export interface ICommentsRepository {
  getCommentById(id: string): Promise<TCommentDb | null>;
  createCommentInPost(newComment: TCommentDb): Promise<ObjectId | null>;
  updateCommentById(args: { id: string; content: string }): Promise<boolean>;
  updateLikeCounts(
    commentId: string,
    counts: { likesCount: number; dislikesCount: number },
  ): Promise<boolean>;
  deleteCommentById(id: string): Promise<boolean>;
}
