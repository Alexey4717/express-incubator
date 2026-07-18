import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { TVideoDb } from '../../models/GetVideoOutputModel';
import { UpdateVideoInputModel } from '../../models/UpdateVideoInputModel';
import VideoModel from '../../models/Video-model';
import type { IVideosRepository } from '../contracts/IVideosRepository';

interface UpdateVideoArgs {
  id: string;
  input: UpdateVideoInputModel;
}

@injectable()
export class VideosRepository implements IVideosRepository {
  async createVideo(newVideo: TVideoDb): Promise<ObjectId | null> {
    try {
      const result = await VideoModel.create(newVideo);
      return result._id ?? null;
    } catch (error) {
      console.log(`VideosRepository create video error is occurred: ${error}`);
      return null;
    }
  }

  async updateVideo({ id, input }: UpdateVideoArgs): Promise<boolean> {
    try {
      const result = await VideoModel.updateOne(
        { _id: new ObjectId(id) },
        { $set: input },
      );
      return result?.matchedCount === 1;
    } catch (error) {
      console.log(`VideosRepository update video error is occurred: ${error}`);
      return false;
    }
  }

  async deleteVideoById(id: string): Promise<boolean> {
    try {
      const result = await VideoModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`VideosRepository delete video error is occurred: ${error}`);
      return false;
    }
  }
}
