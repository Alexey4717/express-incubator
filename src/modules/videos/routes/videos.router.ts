import { Router } from 'express';

import { videoControllers } from '../../../app/composition-root';
import { inputValidationsMiddleware } from '../../../core/middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../core/middlewares/paramId-validation-middleware';
import { VIDEOS_ROUTES } from '../constants/videos.paths';
import { createVideoInputValidations } from '../validations/video/createVideoInputValidations';
import { updateVideoInputValidations } from '../validations/video/updateVideoInputValidations';

export const videosRouter = Router({});

videosRouter.get(
  VIDEOS_ROUTES.ROOT,
  videoControllers.getVideos.bind(videoControllers),
);
videosRouter.get(
  VIDEOS_ROUTES.BY_ID,
  paramIdValidationMiddleware,
  inputValidationsMiddleware,
  videoControllers.getVideo.bind(videoControllers),
);

videosRouter.post(
  VIDEOS_ROUTES.ROOT,
  createVideoInputValidations,
  inputValidationsMiddleware,
  videoControllers.createVideo.bind(videoControllers),
);

videosRouter.put(
  VIDEOS_ROUTES.BY_ID,
  paramIdValidationMiddleware,
  updateVideoInputValidations,
  inputValidationsMiddleware,
  videoControllers.updateVideo.bind(videoControllers),
);

videosRouter.delete(
  VIDEOS_ROUTES.BY_ID,
  paramIdValidationMiddleware,
  inputValidationsMiddleware,
  videoControllers.deleteVideo.bind(videoControllers),
);
