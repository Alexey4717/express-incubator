import { Response } from 'express';

import { constants } from 'http2';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import {
  CommentManageStatuses,
  RequestWithParams,
  RequestWithParamsAndBody,
  SingleJsonApiResponse,
} from '@/core/types/common';

import type { GetMappedUserOutputModel } from '@/modules/users';

import { mapToCommentOutput } from '../helpers/map-to-comment-output';
import { GetCommentInputModel } from '../models/GetCommentInputModel';
import { GetCommentOutputModel } from '../models/GetCommentOutputModel';
import { UpdateCommentInputModel } from '../models/UpdateCommentInputModel';
import { CommentsService } from '../services/comments-service';

@injectable()
export class CommentControllers {
  constructor(protected commentsService: CommentsService) {}

  async getComment(
    req: RequestWithParams<{ id: string }>,
    res: Response<SingleJsonApiResponse<GetCommentOutputModel>>,
  ) {
    const foundComment = await this.commentsService.findById(req.params.id);
    if (!foundComment) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req?.context?.user?._id).toString()
      : undefined;

    res.status(constants.HTTP_STATUS_OK).json(
      mapToCommentOutput({
        ...foundComment,
        currentUserId,
      }),
    );
  }

  async updateComment(
    req: RequestWithParamsAndBody<
      GetCommentInputModel,
      UpdateCommentInputModel
    >,
    res: Response<GetMappedUserOutputModel>,
  ) {
    if (!req.context.user) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const result = await this.commentsService.updateCommentById({
      userId: req.context.user._id.toString(),
      id: req.params.commentId,
      content: req.body.content,
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
  }

  async deleteComment(
    req: RequestWithParams<GetCommentInputModel>,
    res: Response,
  ) {
    if (!req.context.user) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const result = await this.commentsService.deleteCommentById({
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
  }

  async changeLikeStatus(
    req: RequestWithParams<GetCommentInputModel>,
    res: Response,
  ) {
    if (!req.context.user) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const result = await this.commentsService.updateCommentLikeStatus({
      commentId: req.params.commentId,
      userId: req.context.user._id.toString(),
      likeStatus: req.body.likeStatus,
    });

    if (!result) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
