import { Request, Response } from 'express';

import { constants } from 'http2';
import { inject, injectable } from 'inversify';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { QueryBus } from '@/core/cqrs/buses/query-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from '@/core/types/common';

import { CreateVideoCommand } from '../application/commands/create-video.command';
import { DeleteVideoCommand } from '../application/commands/delete-video.command';
import { UpdateVideoCommand } from '../application/commands/update-video.command';
import { GetVideoByIdQuery } from '../application/queries/get-video-by-id.query';
import { GetVideosQuery } from '../application/queries/get-videos.query';
import { CreateVideoInputModel } from '../models/CreateVideoInputModel';
import { GetVideoInputModel } from '../models/GetVideoInputModel';
import {
  GetMappedVideoOutputModel,
  GetVideoOutputModel,
} from '../models/GetVideoOutputModel';
import { UpdateVideoInputModel } from '../models/UpdateVideoInputModel';

@injectable()
export class VideoControllers {
  constructor(
    @inject(CQRS_TYPES.QueryBus)
    protected queryBus: QueryBus,
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
  ) {}

  async getVideos(req: Request, res: Response<GetVideoOutputModel[]>) {
    const videos = await this.queryBus.execute<GetVideoOutputModel[]>(
      new GetVideosQuery(),
    );
    res.status(constants.HTTP_STATUS_OK).json(videos);
  }

  async getVideo(
    req: RequestWithParams<GetVideoInputModel>,
    res: Response<GetVideoOutputModel>,
  ) {
    const videoId = req.params?.id;
    if (!videoId) {
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
      return;
    }

    const foundVideo = await this.queryBus.execute<GetVideoOutputModel>(
      new GetVideoByIdQuery(videoId),
    );

    res.status(constants.HTTP_STATUS_OK).json(foundVideo);
  }

  async createVideo(
    req: RequestWithBody<CreateVideoInputModel>,
    res: Response<GetMappedVideoOutputModel>,
  ) {
    const videoId = await this.commandBus.execute<string>(
      new CreateVideoCommand(req.body),
    );

    const viewModel = await this.queryBus.execute<GetMappedVideoOutputModel>(
      new GetVideoByIdQuery(videoId),
    );

    res.status(constants.HTTP_STATUS_CREATED).json(viewModel);
  }

  async updateVideo(
    req: RequestWithParamsAndBody<GetVideoInputModel, UpdateVideoInputModel>,
    res: Response,
  ) {
    const videoId = req.params?.id;
    await this.commandBus.execute(new UpdateVideoCommand(videoId, req.body));
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deleteVideo(req: Request<GetVideoInputModel>, res: Response<void>) {
    const videoId = req.params?.id;
    await this.commandBus.execute(new DeleteVideoCommand(videoId));
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
