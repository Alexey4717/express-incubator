import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CreateVideoInputModel } from '../models/CreateVideoInputModel';
import { UpdateVideoInputModel } from '../models/UpdateVideoInputModel';
import { VideosRepository } from '../repositories/CUD/videos-repository';

interface UpdateVideoArgs {
  id: string;
  input: UpdateVideoInputModel;
}

@injectable()
export class VideosService {
  constructor(protected videosRepository: VideosRepository) {}

  async createVideo(input: CreateVideoInputModel): Promise<string | null> {
    const { title, author, availableResolutions } = input || {};

    const currentDate = new Date();
    const createdAt = currentDate.toISOString();
    const publicationDate = new Date(
      new Date(currentDate).setDate(currentDate.getDate() + 1),
    ).toISOString();

    const canBeDownloaded = false;
    const minAgeRestriction = null;

    const newVideo = {
      _id: new ObjectId(),
      title,
      author,
      canBeDownloaded,
      minAgeRestriction,
      createdAt,
      publicationDate,
      availableResolutions: availableResolutions ?? null,
    };

    const videoId = await this.videosRepository.createVideo(newVideo);
    return videoId?.toString() ?? null;
  }

  async updateVideo({ id, input }: UpdateVideoArgs): Promise<boolean> {
    return await this.videosRepository.updateVideo({ id, input });
  }

  async deleteVideoById(id: string): Promise<boolean> {
    return await this.videosRepository.deleteVideoById(id);
  }
}
