import {Router} from "express";

import {createVideoInputValidations} from "../../../validations/video/createVideoInputValidations";
import {updateVideoInputValidations} from "../../../validations/video/updateVideoInputValidations";
import {inputValidationsMiddleware} from "../../../middlewares/input-validations-middleware";
import {paramIdValidationMiddleware} from "../../../middlewares/paramId-validation-middleware";
import {settings} from "../../../settings";
import {videoControllers} from "../../../composition-root";


export const videosRouter = Router({});

videosRouter.get(
    '/',
    videoControllers.getVideos.bind(videoControllers)
);
videosRouter.get(
    `/:id(${settings.ID_PATTERN_BY_DB_TYPE})`,
    paramIdValidationMiddleware,
    inputValidationsMiddleware,
    videoControllers.getVideo.bind(videoControllers)
);

videosRouter.post(
    '/',
    createVideoInputValidations,
    inputValidationsMiddleware,
    videoControllers.createVideo.bind(videoControllers)
);

videosRouter.put(
    `/:id(${settings.ID_PATTERN_BY_DB_TYPE})`,
    paramIdValidationMiddleware,
    updateVideoInputValidations,
    inputValidationsMiddleware,
    videoControllers.updateVideo.bind(videoControllers)
);

videosRouter.delete(
    `/:id(${settings.ID_PATTERN_BY_DB_TYPE})`,
    paramIdValidationMiddleware,
    inputValidationsMiddleware,
    videoControllers.deleteVideo.bind(videoControllers)
);
