import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { VideoEntity } from '../../domain/entities/video.entity';
import { VideoPersistenceMapper } from '../../domain/mappers/video.persistence-mapper';
import VideoModel from '../../models/Video-model';
import type { IVideosRepository } from '../contracts/IVideosRepository';

@injectable()
export class VideosRepository implements IVideosRepository {
  async getVideoById(id: string): Promise<VideoEntity | null> {
    try {
      const raw = await VideoModel.findOne({ _id: new ObjectId(id) }).lean();
      return raw ? VideoPersistenceMapper.toDomain(raw) : null;
    } catch (error) {
      console.log(`VideosRepository.getVideoById error is occurred: ${error}`);
      return null;
    }
  }

  async createVideo(video: VideoEntity): Promise<ObjectId | null> {
    try {
      const data = VideoPersistenceMapper.toPersistence(video);
      const result = await VideoModel.create(data);
      return result._id ?? null;
    } catch (error) {
      console.log(`VideosRepository create video error is occurred: ${error}`);
      return null;
    }
  }

  async save(video: VideoEntity): Promise<boolean> {
    try {
      const data = VideoPersistenceMapper.toPersistence(video);
      const result = await VideoModel.updateOne(
        { _id: data._id },
        {
          $set: {
            title: data.title,
            author: data.author,
            canBeDownloaded: data.canBeDownloaded,
            minAgeRestriction: data.minAgeRestriction,
            publicationDate: data.publicationDate,
            availableResolutions: data.availableResolutions,
          },
        },
      );
      return result?.matchedCount === 1;
    } catch (error) {
      console.log(`VideosRepository save video error is occurred: ${error}`);
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
