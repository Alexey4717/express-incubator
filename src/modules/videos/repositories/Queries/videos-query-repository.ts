import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { GetVideoOutputModelFromMongoDB } from '../../models/GetVideoOutputModel';
import VideoModel from '../../models/Video-model';

@injectable()
export class VideosQueryRepository {
  async getVideos(): Promise<GetVideoOutputModelFromMongoDB[]> {
    try {
      return await VideoModel.find({}).lean();
    } catch (error) {
      console.log(
        `VideosQueryRepository get videos error is occurred: ${error}`,
      );
      return [];
    }
  }

  async findVideoById(
    id: string,
  ): Promise<GetVideoOutputModelFromMongoDB | null> {
    try {
      return await VideoModel.findOne({ _id: new ObjectId(id) }).lean();
    } catch (error) {
      console.log(
        `VideosQueryRepository find video by id error is occurred: ${error}`,
      );
      return null;
    }
  }
}
