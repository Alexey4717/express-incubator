import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import type { IVideosQueryRepository } from '../../repositories/contracts/IVideosQueryRepository';
import { VIDEOS_TYPES } from '../../videos.tokens';
import { GetVideoByIdQuery } from './get-video-by-id.query';
import { GetVideosQuery } from './get-videos.query';

@injectable()
export class GetVideosQueryHandler {
  constructor(
    @inject(VIDEOS_TYPES.IVideosQueryRepository)
    protected videosQueryRepository: IVideosQueryRepository,
  ) {}

  async execute(_query: GetVideosQuery) {
    return await this.videosQueryRepository.getVideos();
  }
}

@injectable()
export class GetVideoByIdQueryHandler {
  constructor(
    @inject(VIDEOS_TYPES.IVideosQueryRepository)
    protected videosQueryRepository: IVideosQueryRepository,
  ) {}

  async execute(query: GetVideoByIdQuery) {
    const video = await this.videosQueryRepository.findVideoById(query.id);
    if (!video) {
      throw domainException(DomainExceptionCode.NotFound, 'VideoNotFound');
    }
    return video;
  }
}
