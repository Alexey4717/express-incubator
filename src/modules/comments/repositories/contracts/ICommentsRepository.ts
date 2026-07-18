import { ObjectId } from 'mongodb';

import { LikeStatus } from '@/core/types/common';

import { TCommentDb } from '../../models/GetCommentOutputModel';

export interface ICommentsRepository {
  getCommentById(id: string): Promise<TCommentDb | null>;
  createCommentInPost(newComment: TCommentDb): Promise<ObjectId | null>;
  updateCommentById(args: { id: string; content: string }): Promise<boolean>;
  updateCommentLikeStatusByCommentId(args: {
    commentId: string;
    userId: string;
    likeStatus: LikeStatus;
  }): Promise<boolean>;
  deleteCommentById(id: string): Promise<boolean>;
}
