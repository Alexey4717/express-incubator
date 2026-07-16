import {Router} from "express";

import {inputValidationsMiddleware} from "../../../middlewares/input-validations-middleware";
import {adminBasicAuthMiddleware} from "../../../middlewares/admin-basicAuth-middleware";
import {createPostInputValidations} from "../../../validations/post/createPostInputValidations";
import {updatePostInputValidations} from "../../../validations/post/updatePostInputValidations";
import {paramIdValidationMiddleware} from "../../../middlewares/paramId-validation-middleware";
import {settings} from "../../../settings";
import {authMiddleware} from "../../../middlewares/auth-middleware";
import {createCommentInputValidations} from "../../../validations/comment/createCommentInputValidations";
import {postControllers} from "../../../controllers/post-controllers";
import {setUserDataMiddleware} from "../../../middlewares/set-user-data-middleware";
import {updatePostLikeStatusInputValidations} from "../../../validations/post/updatePostLikeStatusInputValidations";


export const postsRouter = Router({});

postsRouter.get(
    '/',
    setUserDataMiddleware,
    postControllers.getPosts
);
postsRouter.get(
    `/:id(${settings.ID_PATTERN_BY_DB_TYPE})`,
    paramIdValidationMiddleware,
    setUserDataMiddleware,
    inputValidationsMiddleware,
    postControllers.getPost
);
postsRouter.get(
    `/:postId(${settings.ID_PATTERN_BY_DB_TYPE})/comments`,
    setUserDataMiddleware,
    postControllers.getCommentsOfPost
);

postsRouter.post(
    '/',
    adminBasicAuthMiddleware,
    setUserDataMiddleware,
    createPostInputValidations,
    inputValidationsMiddleware,
    postControllers.createPost
);
postsRouter.post(
    `/:postId(${settings.ID_PATTERN_BY_DB_TYPE})/comments`,
    authMiddleware,
    paramIdValidationMiddleware,
    createCommentInputValidations,
    inputValidationsMiddleware,
    postControllers.createCommentInPost
);

postsRouter.put(
    `/:id(${settings.ID_PATTERN_BY_DB_TYPE})`,
    adminBasicAuthMiddleware,
    paramIdValidationMiddleware,
    updatePostInputValidations,
    inputValidationsMiddleware,
    postControllers.updatePost
);

postsRouter.put(
    `/:postId(${settings.ID_PATTERN_BY_DB_TYPE})/like-status`,
    paramIdValidationMiddleware,
    authMiddleware,
    updatePostLikeStatusInputValidations,
    inputValidationsMiddleware,
    postControllers.updatePostLikeStatus
);

postsRouter.delete(
    `/:id(${settings.ID_PATTERN_BY_DB_TYPE})`,
    adminBasicAuthMiddleware,
    paramIdValidationMiddleware,
    postControllers.deletePost
);
