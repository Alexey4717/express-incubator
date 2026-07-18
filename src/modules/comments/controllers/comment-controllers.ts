import { Response } from 'express';

import { constants } from 'http2';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { isFailure, sendFailure } from '@/core/result/handle-result';
import {
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
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req?.context?.user?._id).toString()
      : undefined;

    const foundComment = await this.commentsService.findById(
      req.params.id,
      currentUserId,
    );
    if (!foundComment) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    res.status(constants.HTTP_STATUS_OK).json(mapToCommentOutput(foundComment));
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

    if (isFailure(result)) {
      sendFailure(res, result);
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

    if (isFailure(result)) {
      sendFailure(res, result);
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

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
