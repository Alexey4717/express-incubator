import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import CommentModel from '../../models/Comment-model';
import { TCommentDb } from '../../models/GetCommentOutputModel';
import type { ICommentsRepository } from '../contracts/ICommentsRepository';

@injectable()
export class CommentsRepository implements ICommentsRepository {
  async getCommentById(id: string): Promise<TCommentDb | null> {
    try {
      return await CommentModel.findOne({ _id: new ObjectId(id) }).lean();
    } catch (error) {
      console.log(
        `CommentsRepository.getCommentById error is occurred: ${error}`,
      );
      return null;
    }
  }

  async createCommentInPost(newComment: TCommentDb): Promise<ObjectId | null> {
    try {
      const result = await CommentModel.create(newComment);
      return result._id ?? null;
    } catch (error) {
      console.log(
        'CommentsRepository.createCommentInPost error is occurred: ',
        error,
      );
      return null;
    }
  }

  async updateCommentById({
    id,
    content,
  }: {
    id: string;
    content: string;
  }): Promise<boolean> {
    try {
      const result = await CommentModel.updateOne(
        { _id: new ObjectId(id) },
        { $set: { content } },
      );
      return result?.matchedCount === 1;
    } catch (error) {
      console.log(
        'CommentsRepository.updateCommentById error is occurred: ',
        error,
      );
      return false;
    }
  }

  async updateLikeCounts(
    commentId: string,
    counts: { likesCount: number; dislikesCount: number },
  ): Promise<boolean> {
    try {
      const result = await CommentModel.updateOne(
        { _id: new ObjectId(commentId) },
        {
          $set: {
            likesCount: counts.likesCount,
            dislikesCount: counts.dislikesCount,
          },
        },
      );
      return result.matchedCount === 1;
    } catch (error) {
      console.log(
        'CommentsRepository.updateLikeCounts error is occurred: ',
        error,
      );
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
