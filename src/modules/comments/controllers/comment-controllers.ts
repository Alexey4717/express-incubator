import { Response } from 'express';

import { constants } from 'http2';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { QueryBus } from '@/core/cqrs/buses/query-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  SingleJsonApiResponse,
} from '@/core/types/common';

import type { GetMappedUserOutputModel } from '@/modules/users';

import { DeleteCommentCommand } from '../application/commands/delete-comment.command';
import { UpdateCommentLikeStatusCommand } from '../application/commands/update-comment-like-status.command';
import { UpdateCommentCommand } from '../application/commands/update-comment.command';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query';
import { mapToCommentOutput } from '../helpers/map-to-comment-output';
import { GetCommentInputModel } from '../models/GetCommentInputModel';
import { GetCommentOutputModel } from '../models/GetCommentOutputModel';
import type { GetMappedCommentOutputModel } from '../models/GetCommentOutputModel';
import { UpdateCommentInputModel } from '../models/UpdateCommentInputModel';

@injectable()
export class CommentControllers {
  constructor(
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
    @inject(CQRS_TYPES.QueryBus)
    protected queryBus: QueryBus,
  ) {}

  async getComment(
    req: RequestWithParams<{ id: string }>,
    res: Response<SingleJsonApiResponse<GetCommentOutputModel>>,
  ) {
    const currentUserId = req?.context?.user?._id
      ? new ObjectId(req?.context?.user?._id).toString()
      : undefined;

    const foundComment =
      await this.queryBus.execute<GetMappedCommentOutputModel>(
        new GetCommentByIdQuery(req.params.id, currentUserId),
      );

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

    await this.commandBus.execute(
      new UpdateCommentCommand(
        req.params.commentId,
        req.body.content,
        req.context.user._id.toString(),
      ),
    );

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

    await this.commandBus.execute(
      new DeleteCommentCommand(
        req.params.commentId,
        req.context.user._id.toString(),
      ),
    );

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

    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(
        req.params.commentId,
        req.context.user._id.toString(),
        req.body.likeStatus,
      ),
    );

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
