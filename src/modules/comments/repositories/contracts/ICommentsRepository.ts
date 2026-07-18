import { ObjectId } from 'mongodb';

import type { LikeCounts } from '@/core/repositories/contracts/ILikeStatusRepository';

import { CommentEntity } from '../../domain/entities/comment.entity';

export interface ICommentsRepository {
  getCommentById(id: string): Promise<CommentEntity | null>;
  createCommentInPost(comment: CommentEntity): Promise<ObjectId | null>;
  save(comment: CommentEntity): Promise<boolean>;
  deleteCommentById(id: string): Promise<boolean>;
}
