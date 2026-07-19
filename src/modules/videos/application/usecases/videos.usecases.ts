import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

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

  async execute(command: CreateVideoCommand): Promise<string> {
    const video = VideoEntity.create(command.input);
    const videoId = await this.videosRepository.createVideo(video);
    if (!videoId) {
      throw domainException(
        DomainExceptionCode.BadRequest,
        'CreateVideoFailed',
      );
    }
    return videoId.toString();
  }
}

@injectable()
export class UpdateVideoUseCase {
  constructor(
    @inject(VIDEOS_TYPES.IVideosRepository)
    protected videosRepository: IVideosRepository,
  ) {}

  async execute(command: UpdateVideoCommand): Promise<null> {
    const video = await this.videosRepository.getVideoById(command.id);
    if (!video) {
      throw domainException(DomainExceptionCode.NotFound, 'VideoNotFound');
    }

    video.update(command.input);
    const updated = await this.videosRepository.save(video);
    if (!updated) {
      throw domainException(DomainExceptionCode.NotFound, 'VideoNotFound');
    }
    return null;
  }
}

@injectable()
export class DeleteVideoUseCase {
  constructor(
    @inject(VIDEOS_TYPES.IVideosRepository)
    protected videosRepository: IVideosRepository,
  ) {}

  async execute(command: DeleteVideoCommand): Promise<null> {
    const deleted = await this.videosRepository.deleteVideoById(command.id);
    if (!deleted) {
      throw domainException(DomainExceptionCode.NotFound, 'VideoNotFound');
    }
    return null;
  }
}
