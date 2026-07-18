import { Container } from 'inversify';

import { VideoControllers } from './controllers/video-controllers';
import { VideosRepository } from './repositories/CUD/videos-repository';
import { VideosQueryRepository } from './repositories/Queries/videos-query-repository';
import { VideosService } from './services/videos-service';
import { VIDEOS_TYPES } from './videos.tokens';

export const bindVideosModule = (container: Container): void => {
  container.bind(VIDEOS_TYPES.IVideosRepository).to(VideosRepository);
  container.bind(VIDEOS_TYPES.IVideosQueryRepository).to(VideosQueryRepository);
  container.bind(VideosService).toSelf();
  container.bind(VideoControllers).toSelf();
};
