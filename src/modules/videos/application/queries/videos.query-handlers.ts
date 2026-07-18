import { inject, injectable } from 'inversify';

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
    return await this.videosQueryRepository.findVideoById(query.id);
  }
}
