import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { getMappedVideoViewModel } from '../../helpers/map-to-video-output';
import { GetMappedVideoOutputModel } from '../../models/GetVideoOutputModel';
import VideoModel from '../../models/Video-model';

@injectable()
export class VideosQueryRepository {
  async getVideos(): Promise<GetMappedVideoOutputModel[]> {
    try {
      const items = await VideoModel.find({}).lean();
      return items.map(getMappedVideoViewModel);
    } catch (error) {
      console.log(
        `VideosQueryRepository get videos error is occurred: ${error}`,
      );
      return [];
    }
  }

  async findVideoById(id: string): Promise<GetMappedVideoOutputModel | null> {
    try {
      const foundVideo = await VideoModel.findOne({
        _id: new ObjectId(id),
      }).lean();
      return foundVideo ? getMappedVideoViewModel(foundVideo) : null;
    } catch (error) {
      console.log(
        `VideosQueryRepository find video by id error is occurred: ${error}`,
      );
      return null;
    }
  }
}
