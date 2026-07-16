import { Request, Response } from 'express';

import { constants } from 'http2';
import { injectable } from 'inversify';

import BlogModel from '../../blogs/models/Blog-model';
import CommentModel from '../../comments/models/Comment-model';
import PostModel from '../../posts/models/Post-model';
import SecurityDeviceModel from '../../security-devices/models/SecurityDevice-model';
import UserModel from '../../users/models/User-model';
import VideoModel from '../../videos/models/Video-model';

@injectable()
export class TestingControllers {
  async deleteAllData(req: Request, res: Response<void>) {
    await Promise.all([
      BlogModel.deleteMany({}),
      PostModel.deleteMany({}),
      VideoModel.deleteMany({}),
      UserModel.deleteMany({}),
      CommentModel.deleteMany({}),
      SecurityDeviceModel.deleteMany({}),
    ]);

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
