import { inject, injectable } from 'inversify';

import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import { VideoEntity } from '../../domain/entities/video.entity';
import type { IVideosRepository } from '../../repositories/contracts/IVideosRepository';
import { VIDEOS_TYPES } from '../../videos.tokens';
import { CreateVideoCommand } from '../commands/create-video.command';
import { DeleteVideoCommand } from '../commands/delete-video.command';
import { UpdateVideoCommand } from '../commands/update-video.command';

@injectable()
export class CreateVideoUseCase {
  constructor(
    @inject(VIDEOS_TYPES.IVideosRepository)
    protected videosRepository: IVideosRepository,
  ) {}

  async execute(command: CreateVideoCommand): Promise<Result<string>> {
    const video = VideoEntity.create(command.input);
    const videoId = await this.videosRepository.createVideo(video);
    if (!videoId) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateVideoFailed' });
    }
    return ok(videoId.toString());
  }
}

@injectable()
export class UpdateVideoUseCase {
  constructor(
    @inject(VIDEOS_TYPES.IVideosRepository)
    protected videosRepository: IVideosRepository,
  ) {}

  async execute(command: UpdateVideoCommand): Promise<Result<null>> {
    const updated = await this.videosRepository.updateVideo({
      id: command.id,
      input: command.input,
    });
    if (!updated) {
      return fail(ResultStatus.NotFound, { reason: 'VideoNotFound' });
    }
    return ok(null);
  }
}

@injectable()
export class DeleteVideoUseCase {
  constructor(
    @inject(VIDEOS_TYPES.IVideosRepository)
    protected videosRepository: IVideosRepository,
  ) {}

  async execute(command: DeleteVideoCommand): Promise<Result<null>> {
    const deleted = await this.videosRepository.deleteVideoById(command.id);
    if (!deleted) {
      return fail(ResultStatus.NotFound, { reason: 'VideoNotFound' });
    }
    return ok(null);
  }
}
