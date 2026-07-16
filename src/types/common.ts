import {Request} from 'express';
import {Secret} from "jsonwebtoken";

import {GetMappedVideoOutputModel} from "../models/VideoModels/GetVideoOutputModel";
import {GetMappedBlogOutputModel} from "../models/BlogModels/GetBlogOutputModel";
import {GetMappedPostOutputModel} from "../models/PostModels/GetPostOutputModel";
import {SortBlogsBy} from "../models/BlogModels/GetBlogsInputModel";
import {SortPostsBy} from "../models/PostModels/GetPostsInputModel";
import {SortUsersBy} from "../models/UserModels/GetUsersInputModel";
import {GetUserOutputModelFromMongoDB} from "../models/UserModels/GetUserOutputModel";
import {GetSecurityDeviceOutputModelFromMongoDB} from "../models/SecurityDeviceModels/GetSecurityDeviceOutputModel";


export enum AvailableResolutions {
    P144 = 'P144',
    P240 = 'P240',
    P360 = 'P360',
    P480 = 'P480',
    P720 = 'P720',
    P1080 = 'P1080',
    P1440 = 'P1440',
    P2160 = 'P2160'
}

export enum SortDirections {
    desc = 'desc',
    asc = 'asc'
}

export enum LikeStatus {
    None = "None",
    Like = "Like",
    Dislike = "Dislike"
}

export const enum CommentManageStatuses {
    NOT_FOUND = 'NOT_FOUND',
    NOT_OWNER = 'NOT_OWNER',
    SUCCESS = 'SUCCESS',
}

export const enum TokenTypes {
    refresh = 'refresh',
    access = 'access'
}

export type SettingsType = {
    MONGO_URI: string
    JWT_SECRET: Secret
    REFRESH_JWT_SECRET: Secret
    DB_NAME: string
    ID_PATTERN_BY_DB_TYPE: string
    JWT_EXPIRATION: string | number | undefined
    JWT_REFRESH_EXPIRATION: string | number | undefined
}

export type RequestContextType = {
    user: GetUserOutputModelFromMongoDB | null
    securityDevice: GetSecurityDeviceOutputModelFromMongoDB | null;
};

type CommonQueryParamsTypes = {
    sortDirection: SortDirections
    pageNumber: number
    pageSize: number
};

export type GetBlogsArgs = CommonQueryParamsTypes & {
    searchNameTerm: string | null
    sortBy: SortBlogsBy
};

export type GetPostsArgs = CommonQueryParamsTypes & {
    sortBy: SortPostsBy
};

export type GetUsersArgs = CommonQueryParamsTypes & {
    searchLoginTerm: string | null
    searchEmailTerm: string | null
    sortBy: SortUsersBy
};

export type GetPostsInBlogArgs = GetPostsArgs & {
    blogId: string
}

type User = {
    id: number
    login: string
    password: string
};

export type DataBase = {
    users: User[]
    videos: GetMappedVideoOutputModel[]
    blogs: GetMappedBlogOutputModel[]
    posts: GetMappedPostOutputModel[]
};

export type Error = {
    message: string
    field: string
};

export type Paginator<T> = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: T
};

export type CheckCredentialsInputArgs = {
    loginOrEmail: string,
    password: string
};

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParamsAndQuery<T, B> = Request<T, {}, {}, B>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;