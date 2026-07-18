import { inject, injectable } from 'inversify';

import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import { VideoEntity } from '../domain/entities/video.entity';
import { CreateVideoInputModel } from '../models/CreateVideoInputModel';
import { UpdateVideoInputModel } from '../models/UpdateVideoInputModel';
import type { IVideosRepository } from '../repositories/contracts/IVideosRepository';
import { VIDEOS_TYPES } from '../videos.tokens';

interface UpdateVideoArgs {
  id: string;
  input: UpdateVideoInputModel;
}

@injectable()
export class VideosService {
  constructor(
    @inject(VIDEOS_TYPES.IVideosRepository)
    protected videosRepository: IVideosRepository,
  ) {}

  async createVideo(input: CreateVideoInputModel): Promise<Result<string>> {
    const video = VideoEntity.create(input);
    const videoId = await this.videosRepository.createVideo(video);
    if (!videoId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateVideoFailed' });
    }
    return ok(videoId.toString());
  }

  async updateVideo({ id, input }: UpdateVideoArgs): Promise<Result<null>> {
    const updated = await this.videosRepository.updateVideo({ id, input });
    if (!updated) {
      return fail(ResultStatus.NotFound, { reason: 'VideoNotFound' });
    }
    return ok(null);
  }

  async deleteVideoById(id: string): Promise<Result<null>> {
    const deleted = await this.videosRepository.deleteVideoById(id);
    if (!deleted) {
      return fail(ResultStatus.NotFound, { reason: 'VideoNotFound' });
    }
    return ok(null);
  }
}
