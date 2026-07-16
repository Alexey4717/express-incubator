import {Response} from "express";
import {constants} from "http2";
import {ObjectId} from 'mongodb';

import {CommentManageStatuses, RequestWithParams, RequestWithParamsAndBody, TokenTypes} from "../types/common";
import {GetMappedCommentOutputModel} from "../models/CommentsModels/GetCommentOutputModel";
import {commentsQueryRepository} from "../repositories/Queries-repo/comments-query-repository";
import {getMappedCommentViewModel} from "../helpers";
import {GetCommentInputModel} from "../models/CommentsModels/GetCommentInputModel";
import {UpdateCommentInputModel} from "../models/CommentsModels/UpdateCommentInputModel";
import {GetMappedUserOutputModel} from "../models/UserModels/GetUserOutputModel";
import {commentsService} from "../domain/comments-service";
import {LikeStatus} from '../types/common';


export const commentControllers = {
    async getComment(
        req: RequestWithParams<{ id: string }>,
        res: Response<GetMappedCommentOutputModel>
    ) {
        const foundComment = await commentsQueryRepository.getCommentById(req.params.id);
        if (!foundComment) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND)
            return;
        }

        const currentUserId = req?.context?.user?._id ? new ObjectId(req?.context?.user?._id).toString() : undefined;
        // const foundReactionByUserId = foundComment.reactions.find((reaction) => reaction.userId === currentUserId);
        // const myStatus = foundReactionByUserId?.likeStatus ?? LikeStatus.None;

        res.status(constants.HTTP_STATUS_OK).json(getMappedCommentViewModel({
            ...foundComment,
            currentUserId
        }));
    },

    async updateComment(
        req: RequestWithParamsAndBody<GetCommentInputModel, UpdateCommentInputModel>,
        res: Response<GetMappedUserOutputModel>
    ) {
        if (!req.context.user) {
            res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED)
            return
        }

        const result = await commentsService.updateCommentById({
            userId: req.context.user._id.toString(),
            id: req.params.commentId,
            content: req.body.content
        });

        if (result === CommentManageStatuses.NOT_OWNER) {
            res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
            return;
        }

        if (result === CommentManageStatuses.NOT_FOUND) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },

    async deleteComment(
        req: RequestWithParams<GetCommentInputModel>,
        res: Response
    ) {
        if (!req.context.user) {
            res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED)
            return
        }

        const result = await commentsService.deleteCommentById({
            commentId: req.params.commentId,
            userId: req.context.user._id.toString(),
        });

        if (result === CommentManageStatuses.NOT_OWNER) {
            res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
            return;
        }

        if (result === CommentManageStatuses.NOT_FOUND) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },

    async changeLikeStatus(
        req: RequestWithParams<GetCommentInputModel>,
        res: Response
    ) {
        if (!req.context.user) {
            res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED)
            return
        }

        const result = await commentsService.updateCommentLikeStatus({
            commentId: req.params.commentId,
            userId: req.context.user._id.toString(),
            likeStatus: req.body.likeStatus
        });

        if (!result) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },
};
