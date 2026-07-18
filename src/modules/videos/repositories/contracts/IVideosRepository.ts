import { ObjectId } from 'mongodb';

import { VideoEntity } from '../../domain/entities/video.entity';
import { UpdateVideoInputModel } from '../../models/UpdateVideoInputModel';

export interface IVideosRepository {
  createVideo(video: VideoEntity): Promise<ObjectId | null>;
  updateVideo(args: {
    id: string;
    input: UpdateVideoInputModel;
  }): Promise<boolean>;
  deleteVideoById(id: string): Promise<boolean>;
}
