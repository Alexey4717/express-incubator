import {ObjectId} from 'mongodb';

import {commentsRepository} from "../repositories/CUD-repo/comments-repository";
import {CommentManageStatuses} from "../types/common";
import {postsQueryRepository} from "../repositories/Queries-repo/posts-query-repository";
import {GetMappedCommentOutputModel, TCommentDb} from "../models/CommentsModels/GetCommentOutputModel";
import {commentsQueryRepository} from "../repositories/Queries-repo/comments-query-repository";
import {LikeStatus} from '../types/common';


interface CreateCommentInput {
    postId: string
    userId: string
    userLogin: string
    content: string
}

interface UpdateCommentArgs {
    id: string
    content: string
}

interface DeleteCommentArgs {
    commentId: string
    userId: string
}

interface UpdateCommentLikeStatusArgs {
    commentId: string
    userId: string
    likeStatus: LikeStatus
}

export const commentsService = {
    _mapCommentToViewType(comment: TCommentDb): GetMappedCommentOutputModel {
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: comment.commentatorInfo,
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None
            }
        }
    },

    async createCommentInPost(
        input: CreateCommentInput
    // ): Promise<GetCommentOutputModelFromMongoDB | null> {
    ): Promise<GetMappedCommentOutputModel | null> {
        const {
            postId,
            content,
            userId,
            userLogin,
        } = input;
        const foundPost = await postsQueryRepository.findPostById(postId);
        if (!foundPost) return null;

        const newComment: TCommentDb = {
            _id: new ObjectId(),
            postId,
            content,
            commentatorInfo: {userId, userLogin},
            createdAt: new Date().toISOString(),
            reactions: [],
        }
        const result = await commentsRepository.createCommentInPost(newComment)
        if (!result) return null;
        return this._mapCommentToViewType(newComment);
    },

    // async createCommentLikeStatus() {},

    async updateCommentLikeStatus({commentId, userId, likeStatus}: UpdateCommentLikeStatusArgs): Promise<boolean> {
        return await commentsRepository.updateCommentLikeStatusByCommentId({
            commentId,
            userId,
            likeStatus
        })
    },

    // async deleteCommentLikeStatusById() {},
    //
    // async getAllLikeStatusesByCommentId() {},

    async updateCommentById({
                                id,
                                content,
                                userId
                            }: UpdateCommentArgs & { userId: string }
    ): Promise<CommentManageStatuses> {
        const checkingResult = await this._checkCommentByOwnerId({commentId: id, userId});
        if (checkingResult !== CommentManageStatuses.SUCCESS) return checkingResult;
        const updateResult = await commentsRepository.updateCommentById({id, content})
        if (!updateResult) return CommentManageStatuses.NOT_FOUND;
        return CommentManageStatuses.SUCCESS;
    },

    async deleteCommentById({commentId, userId}: DeleteCommentArgs): Promise<CommentManageStatuses> {
        const checkingResult = await this._checkCommentByOwnerId({commentId, userId});
        if (checkingResult !== CommentManageStatuses.SUCCESS) return checkingResult;
        const updateResult = await commentsRepository.deleteCommentById(commentId)
        if (!updateResult) return CommentManageStatuses.NOT_FOUND;
        return CommentManageStatuses.SUCCESS;
    },

    async _checkCommentByOwnerId({commentId, userId}: DeleteCommentArgs): Promise<CommentManageStatuses> {
        const foundComment = await commentsQueryRepository.getCommentById(commentId)
        if (!foundComment) return CommentManageStatuses.NOT_FOUND;
        if (foundComment.commentatorInfo.userId !== userId) return CommentManageStatuses.NOT_OWNER;
        return CommentManageStatuses.SUCCESS;
    },
};
