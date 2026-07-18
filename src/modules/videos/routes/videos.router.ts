import { Router } from 'express';

import { inputValidationsMiddleware } from '@/core/middlewares/input-validations-middleware';
import { mongoIdParamValidation } from '@/core/validations/common';

import { VIDEOS_ROUTES } from '../constants/videos.paths';
import { VideoControllers } from '../controllers/video-controllers';
import { createVideoInputValidations } from '../validations/createVideoInputValidations';
import { updateVideoInputValidations } from '../validations/updateVideoInputValidations';

export type VideosRouterDeps = {
  videoControllers: VideoControllers;
};

export const createVideosRouter = ({ videoControllers }: VideosRouterDeps) => {
  const router = Router({});

  router.get(
    VIDEOS_ROUTES.ROOT,
    videoControllers.getVideos.bind(videoControllers),
  );
  router.get(
    VIDEOS_ROUTES.BY_ID,
    mongoIdParamValidation('id'),
    inputValidationsMiddleware,
    videoControllers.getVideo.bind(videoControllers),
  );

  router.post(
    VIDEOS_ROUTES.ROOT,
    createVideoInputValidations,
    inputValidationsMiddleware,
    videoControllers.createVideo.bind(videoControllers),
  );

  router.put(
    VIDEOS_ROUTES.BY_ID,
    mongoIdParamValidation('id'),
    updateVideoInputValidations,
    inputValidationsMiddleware,
    videoControllers.updateVideo.bind(videoControllers),
  );

  router.delete(
    VIDEOS_ROUTES.BY_ID,
    mongoIdParamValidation('id'),
    inputValidationsMiddleware,
    videoControllers.deleteVideo.bind(videoControllers),
  );

  return router;
};
