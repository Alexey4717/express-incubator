import { ObjectId } from 'mongodb';

import { VideoEntity } from '../../domain/entities/video.entity';

export interface IVideosRepository {
  getVideoById(id: string): Promise<VideoEntity | null>;
  createVideo(video: VideoEntity): Promise<ObjectId | null>;
  save(video: VideoEntity): Promise<boolean>;
  deleteVideoById(id: string): Promise<boolean>;
}
