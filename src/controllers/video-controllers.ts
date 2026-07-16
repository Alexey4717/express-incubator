import {Request, Response} from "express";

import {GetMappedVideoOutputModel, GetVideoOutputModel} from "../models/VideoModels/GetVideoOutputModel";
import {VideosQueryRepository} from "../repositories/Queries-repo/videos-query-repository";
import {getMappedVideoViewModel} from "../helpers";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/common";
import {GetVideoInputModel} from "../models/VideoModels/GetVideoInputModel";
import {constants} from "http2";
import {CreateVideoInputModel} from "../models/VideoModels/CreateVideoInputModel";
import {GetErrorOutputModel} from "../models/GetErrorOutputModel";
import {VideosService} from "../domain/videos-service";
import {UpdateVideoInputModel} from "../models/VideoModels/UpdateVideoInputModel";


export class VideoControllers {
    constructor(
        protected videosQueryRepository: VideosQueryRepository,
        protected videosService: VideosService
    ) {}

    async getVideos(
        req: Request,
        res: Response<GetVideoOutputModel[]>
    ) {
        const resData = await this.videosQueryRepository.getVideos();
        const videos = (resData || []).map(getMappedVideoViewModel);
        res
            .status(constants.HTTP_STATUS_OK)
            .json(videos);
    }

    async getVideo(
        req: RequestWithParams<GetVideoInputModel>,
        res: Response<GetVideoOutputModel>
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
        const mappedVideo = getMappedVideoViewModel(foundVideo);
        res
            .status(constants.HTTP_STATUS_OK)
            .json(mappedVideo);
    }

    async createVideo(
        req: RequestWithBody<CreateVideoInputModel>,
        res: Response<GetMappedVideoOutputModel | GetErrorOutputModel>
    ) {
        const createdVideo = await this.videosService.createVideo(req.body)
        res.status(constants.HTTP_STATUS_CREATED).json(getMappedVideoViewModel(createdVideo));
    }

    async updateVideo(
        req: RequestWithParamsAndBody<GetVideoInputModel, UpdateVideoInputModel>,
        res: Response<undefined | GetErrorOutputModel>
    ) {
        const videoId = req.params?.id;
        const isVideoUpdated = await this.videosService.updateVideo({id: videoId, input: req.body})

        if (!isVideoUpdated) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
    }

    async deleteVideo(
        req: Request<GetVideoInputModel>,
        res: Response<void>
    ) {
        const videoId = req.params?.id;
        const isDeletedVideo = await this.videosService.deleteVideoById(videoId);

        if (!isDeletedVideo) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    }
};
