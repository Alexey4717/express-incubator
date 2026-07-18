import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CommentEntity } from '../../domain/entities/comment.entity';
import CommentModel from '../../models/Comment-model';
import type { ICommentsRepository } from '../contracts/ICommentsRepository';

@injectable()
export class CommentsRepository implements ICommentsRepository {
  async getCommentById(id: string): Promise<CommentEntity | null> {
    try {
      const raw = await CommentModel.findOne({ _id: new ObjectId(id) }).lean();
      return raw ? CommentEntity.reconstitute(raw) : null;
    } catch (error) {
      console.log(
        `CommentsRepository.getCommentById error is occurred: ${error}`,
      );
      return null;
    }
  }

  async createCommentInPost(comment: CommentEntity): Promise<ObjectId | null> {
    try {
      const data = comment.toDb();
      const result = await CommentModel.create(data);
      return result._id ?? null;
    } catch (error) {
      console.log(
        'CommentsRepository.createCommentInPost error is occurred: ',
        error,
      );
      return null;
    }
  }

  async save(comment: CommentEntity): Promise<boolean> {
    try {
      const data = comment.toDb();
      const result = await CommentModel.updateOne(
        { _id: data._id },
        {
          $set: {
            content: data.content,
            likesCount: data.likesCount,
            dislikesCount: data.dislikesCount,
          },
        },
      );
      return result?.matchedCount === 1;
    } catch (error) {
      console.log('CommentsRepository.save error is occurred: ', error);
      return false;
    }
  }

  async deleteCommentById(id: string): Promise<boolean> {
    try {
      const result = await CommentModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(
        'CommentsRepository.deleteCommentById error is occurred: ',
        error,
      );
      return false;
    }
  }
}
