import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CreateVideoInputModel } from '../models/CreateVideoInputModel';
import { GetVideoOutputModelFromMongoDB } from '../models/GetVideoOutputModel';
import { UpdateVideoInputModel } from '../models/UpdateVideoInputModel';
import { VideosRepository } from '../repositories/CUD/videos-repository';

interface UpdateVideoArgs {
  id: string;
  input: UpdateVideoInputModel;
}

@injectable()
export class VideosService {
  constructor(protected videosRepository: VideosRepository) {}

  async createVideo(
    input: CreateVideoInputModel,
  ): Promise<GetVideoOutputModelFromMongoDB> {
    const { title, author, availableResolutions } = input || {};

    const currentDate = new Date();
    const createdAt = currentDate.toISOString();
    const publicationDate = new Date(
      new Date(currentDate).setDate(currentDate.getDate() + 1),
    ).toISOString(); // default +1 day from createdAt

    const canBeDownloaded = false; // default
    const minAgeRestriction = null; // default

    const newVideo = {
      _id: new ObjectId(),
      title,
      author,
      canBeDownloaded,
      minAgeRestriction,
      createdAt,
      publicationDate,
      availableResolutions: availableResolutions ?? null, // null is default
    };

    await this.videosRepository.createVideo(newVideo);
    return newVideo as GetVideoOutputModelFromMongoDB;
  }

  async updateVideo({ id, input }: UpdateVideoArgs): Promise<boolean> {
    return await this.videosRepository.updateVideo({ id, input });
  }

  async deleteVideoById(id: string): Promise<boolean> {
    return await this.videosRepository.deleteVideoById(id);
  }
}
