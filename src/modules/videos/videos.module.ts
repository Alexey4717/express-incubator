import { Container } from 'inversify';

import {
  GetVideoByIdQueryHandler,
  GetVideosQueryHandler,
} from './application/queries/videos.query-handlers';
import {
  CreateVideoUseCase,
  DeleteVideoUseCase,
  UpdateVideoUseCase,
} from './application/usecases/videos.usecases';
import { VideoControllers } from './controllers/video-controllers';
import { VideosRepository } from './repositories/CUD/videos-repository';
import { VideosQueryRepository } from './repositories/Queries/videos-query-repository';
import { VIDEOS_TYPES } from './videos.tokens';

export const bindVideosModule = (container: Container): void => {
  container.bind(VIDEOS_TYPES.IVideosRepository).to(VideosRepository);
  container.bind(VIDEOS_TYPES.IVideosQueryRepository).to(VideosQueryRepository);

  container.bind(CreateVideoUseCase).toSelf();
  container.bind(UpdateVideoUseCase).toSelf();
  container.bind(DeleteVideoUseCase).toSelf();
  container.bind(GetVideosQueryHandler).toSelf();
  container.bind(GetVideoByIdQueryHandler).toSelf();
  container.bind(VideoControllers).toSelf();
};
