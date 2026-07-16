import {ObjectId} from "mongodb";

import {commentsCollection} from "../../store/db";
import {
    TCommentDb, TReactions
} from "../../models/CommentsModels/GetCommentOutputModel";
import {LikeStatus} from '../../types/common';
import CommentModel from '../../models/CommentsModels/Comment-model';
import {commentsQueryRepository} from "../Queries-repo/comments-query-repository";


export const commentsRepository = {
    async createCommentInPost(
        newComment: TCommentDb
    ): Promise<boolean> {
        try {
            await CommentModel.create(newComment);
            return true;
            // const result = await commentsCollection.insertOne(newComment)
            // return Boolean(result.insertedId);
        } catch (error) {
            console.log('commentsRepository.createCommentInPost error is occurred: ', error);
            return false;
        }
    },

    async updateCommentById({id, content}: any): Promise<boolean> {
        try {
            const result = await CommentModel.updateOne(
                {"_id": new ObjectId(id)},
                {$set: {content}}
            )
            // const result = await commentsCollection.updateOne(
            //     {"_id": new ObjectId(id)},
            //     {$set: {content}}
            // )
            return result?.matchedCount === 1;
        } catch (error) {
            console.log('commentsRepository.updateCommentById error is occurred: ', error);
            return false;
        }
    },

    async updateCommentLikeStatusByCommentId({
                                                 commentId,
                                                 userId,
                                                 likeStatus
                                             }: { commentId: string, userId: string, likeStatus: LikeStatus }): Promise<boolean> {
        try {
            const filter = {_id: new ObjectId(commentId)};
            const foundComment = await commentsQueryRepository.getCommentById(commentId);

            if (!foundComment) return false

            const foundCommentLikeStatus = foundComment.reactions.find((likeStatus: TReactions) => likeStatus.userId === userId);

            if (!foundCommentLikeStatus) {
                const newCommentLikeStatus: TReactions = {
                    userId,
                    likeStatus,
                    createdAt: new Date().toISOString()
                };

                const result = await CommentModel.updateOne(
                    filter,
                    {$push: {reactions: newCommentLikeStatus}},
                )
                return result.matchedCount === 1;
            }

            if (foundCommentLikeStatus.likeStatus === likeStatus) return true;

            // if (foundCommentLikeStatus.likeStatus === LikeStatus.None) {
            //     const result = await CommentModel.updateOne(
            //         filter,
            //         {$pull: {reactions: {userId}}}
            //     )
            // }

            const result = await CommentModel.updateOne(
                {...filter, 'reactions.userId': userId},
                {
                    $set: {
                        'reactions.$.likeStatus': likeStatus,
                        'reactions.$.createdAt': new Date().toISOString()
                    }
                }
            )

            return result.matchedCount === 1;
        } catch (error) {
            console.log('commentsRepository.updateCommentLikeStatusByCommentId error is occurred: ', error);
            return false;
        }
    },

    async deleteCommentById(id: string): Promise<boolean> {
        try {
            const result = await CommentModel.deleteOne({_id: new ObjectId(id)});
            // const result = await commentsCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            console.log('commentsRepository.deleteCommentById error is occurred: ', error);
            return false;
        }
    },
};
