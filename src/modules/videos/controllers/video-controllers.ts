import { Request, Response } from 'express';

import { constants } from 'http2';
import { injectable } from 'inversify';

import { GetErrorOutputModel } from '@/core/models/GetErrorOutputModel';
import { isFailure, sendFailure } from '@/core/result/handle-result';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from '@/core/types/common';

import { CreateVideoInputModel } from '../models/CreateVideoInputModel';
import { GetVideoInputModel } from '../models/GetVideoInputModel';
import {
  GetMappedVideoOutputModel,
  GetVideoOutputModel,
} from '../models/GetVideoOutputModel';
import { UpdateVideoInputModel } from '../models/UpdateVideoInputModel';
import { VideosQueryRepository } from '../repositories/Queries/videos-query-repository';
import { VideosService } from '../services/videos-service';

@injectable()
export class VideoControllers {
  constructor(
    protected videosQueryRepository: VideosQueryRepository,
    protected videosService: VideosService,
  ) {}

  async getVideos(req: Request, res: Response<GetVideoOutputModel[]>) {
    const videos = await this.videosQueryRepository.getVideos();
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

    const foundVideo = await this.videosQueryRepository.findVideoById(videoId);

    if (!foundVideo) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    res.status(constants.HTTP_STATUS_OK).json(foundVideo);
  }

  async createVideo(
    req: RequestWithBody<CreateVideoInputModel>,
    res: Response<GetMappedVideoOutputModel | GetErrorOutputModel>,
  ) {
    const result = await this.videosService.createVideo(req.body);
    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    const viewModel = await this.videosQueryRepository.findVideoById(
      result.data!,
    );
    if (!viewModel) {
      res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      return;
    }

    res.status(constants.HTTP_STATUS_CREATED).json(viewModel);
  }

  async updateVideo(
    req: RequestWithParamsAndBody<GetVideoInputModel, UpdateVideoInputModel>,
    res: Response<undefined | GetErrorOutputModel>,
  ) {
    const videoId = req.params?.id;
    const result = await this.videosService.updateVideo({
      id: videoId,
      input: req.body,
    });

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deleteVideo(req: Request<GetVideoInputModel>, res: Response<void>) {
    const videoId = req.params?.id;
    const result = await this.videosService.deleteVideoById(videoId);

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
