import { ObjectId } from 'mongodb';

import { LikeStatus } from '@/core/types/common';
import type { NewestLikeType } from '@/core/types/newest-like';

export type { NewestLikeType };

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikeType[];
};

export type GetPostOutputModel = {
  /**
   * Title of post from db, required.
   */
  title: string;

  /**
   * Short description of post from db, required.
   */
  shortDescription: string;

  /**
   * Content of post from db, required.
   */
  content: string;

  /**
   * blogId of post from db, required.
   */
  blogId: string;

  /**
   * Blog name of post from db, required.
   */
  blogName: string;

  /**
   * Date of post creation in db.
   */
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
};

export type GetMappedPostOutputModel = GetPostOutputModel & {
  /**
   * Id of post from db, required.
   */
  id: string;
};

export type TPostDb = {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
};
