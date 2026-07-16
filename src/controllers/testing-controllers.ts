import { Request, Response } from 'express';

import { constants } from 'http2';

import CommentModel from '../models/CommentsModels/Comment-model';
import PostModel from '../models/PostModels/Post-model';
import VideoModel from '../models/VideoModels/Video-model';
import {
  blogsCollection,
  // commentsCollection,
  // postsCollection,
  securityDevicesCollection,
  usersCollection,
  // videosCollection
} from '../store/db';
import { db } from '../store/mockedDB';

export const testingControllers = {
  async deleteAllData(req: Request, res: Response<void>) {
    // deleting from mocked DB
    db.videos = [];
    db.blogs = [];
    db.posts = [];

    // deleting from mongodb atlas
    await Promise.all([
      blogsCollection.deleteMany({}),
      PostModel.deleteMany({}),
      // videosCollection.deleteMany({}),
      VideoModel.deleteMany({}),
      usersCollection.deleteMany({}),
      // commentsCollection.deleteMany({}),
      CommentModel.deleteMany({}),
      securityDevicesCollection.deleteMany({}),
    ]);

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  },
};
