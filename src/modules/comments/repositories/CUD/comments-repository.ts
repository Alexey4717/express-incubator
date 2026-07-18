import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { LikeStatus } from '@/core/types/common';

import CommentModel from '../../models/Comment-model';
import { TCommentDb, TReactions } from '../../models/GetCommentOutputModel';
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

  async updateCommentLikeStatusByCommentId({
    commentId,
    userId,
    likeStatus,
  }: {
    commentId: string;
    userId: string;
    likeStatus: LikeStatus;
  }): Promise<boolean> {
    try {
      const filter = { _id: new ObjectId(commentId) };
      const foundComment = await this.getCommentById(commentId);

      if (!foundComment) return false;

      const foundCommentLikeStatus = foundComment.reactions.find(
        (likeStatus: TReactions) => likeStatus.userId === userId,
      );

      if (!foundCommentLikeStatus) {
        const newCommentLikeStatus: TReactions = {
          userId,
          likeStatus,
          createdAt: new Date().toISOString(),
        };

        const result = await CommentModel.updateOne(filter, {
          $push: { reactions: newCommentLikeStatus },
        });
        return result.matchedCount === 1;
      }

      if (foundCommentLikeStatus.likeStatus === likeStatus) return true;

      const result = await CommentModel.updateOne(
        { ...filter, 'reactions.userId': userId },
        {
          $set: {
            'reactions.$.likeStatus': likeStatus,
            'reactions.$.createdAt': new Date().toISOString(),
          },
        },
      );

      return result.matchedCount === 1;
    } catch (error) {
      console.log(
        'CommentsRepository.updateCommentLikeStatusByCommentId error is occurred: ',
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
