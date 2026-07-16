import { Router } from 'express';

import { videoControllers } from '../../../composition-root';
import { inputValidationsMiddleware } from '../../../middlewares/input-validations-middleware';
import { paramIdValidationMiddleware } from '../../../middlewares/paramId-validation-middleware';
import { createVideoInputValidations } from '../../../validations/video/createVideoInputValidations';
import { updateVideoInputValidations } from '../../../validations/video/updateVideoInputValidations';

export const videosRouter = Router({});

videosRouter.get('/', videoControllers.getVideos.bind(videoControllers));
videosRouter.get(
  '/:id',
  paramIdValidationMiddleware,
  inputValidationsMiddleware,
  videoControllers.getVideo.bind(videoControllers),
);

videosRouter.post(
  '/',
  createVideoInputValidations,
  inputValidationsMiddleware,
  videoControllers.createVideo.bind(videoControllers),
);

videosRouter.put(
  '/:id',
  paramIdValidationMiddleware,
  updateVideoInputValidations,
  inputValidationsMiddleware,
  videoControllers.updateVideo.bind(videoControllers),
);

videosRouter.delete(
  '/:id',
  paramIdValidationMiddleware,
  inputValidationsMiddleware,
  videoControllers.deleteVideo.bind(videoControllers),
);
