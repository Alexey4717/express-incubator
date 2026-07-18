import { Request } from 'express';

import { ParamsDictionary } from 'express-serve-static-core';
import { Secret } from 'jsonwebtoken';

import type { ResourceType } from './resource-type';

export enum AvailableResolutions {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

export enum SortDirections {
  desc = 'desc',
  asc = 'asc',
}

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export const enum CommentManageStatuses {
  NOT_FOUND = 'NOT_FOUND',
  NOT_OWNER = 'NOT_OWNER',
  SUCCESS = 'SUCCESS',
}

export const enum TokenTypes {
  refresh = 'refresh',
  access = 'access',
}

export type SettingsType = {
  MONGO_URI: string;
  ACCESS_JWT_SECRET: Secret;
  REFRESH_JWT_SECRET: Secret;
  DB_NAME: string;
  ID_PATTERN_BY_DB_TYPE: string;
  JWT_ACCESS_EXPIRATION: string | number | undefined;
  JWT_REFRESH_EXPIRATION: string | number | undefined;
};

export type Error = {
  message: string;
  field: string;
};

export type Paginator<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export type PaginatedQueryResult<T> = {
  items: T[];
  totalCount: number;
};

export type JsonApiResource<TAttributes> = {
  type: ResourceType;
  id: string;
  attributes: TAttributes;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
};

export type PaginatedJsonApiResponse<TAttributes> = {
  meta: PaginationMeta;
  data: JsonApiResource<TAttributes>[];
};

export type SingleJsonApiResponse<TAttributes> = {
  data: JsonApiResource<TAttributes>;
};

export type CheckCredentialsInputArgs = {
  loginOrEmail: string;
  password: string;
};

export type RequestWithBody<T> = Request<ParamsDictionary, unknown, T>;
export type RequestWithQuery<T> = Request<
  ParamsDictionary,
  unknown,
  unknown,
  T
>;
export type RequestWithParamsAndQuery<T, B> = Request<T, unknown, unknown, B>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, unknown, B>;
