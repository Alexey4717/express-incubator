import { VideoControllers } from './controllers/video-controllers';
import { VideosService } from './domain/videos-service';
import { VideosRepository } from './repositories/CUD-repo/videos-repository';
import { VideosQueryRepository } from './repositories/Queries-repo/videos-query-repository';

// repositories
const videosRepository = new VideosRepository();
const videosQueryRepository = new VideosQueryRepository();

// services
const videosService = new VideosService(videosRepository);

// controllers
export const videoControllers = new VideoControllers(
  videosQueryRepository,
  videosService,
);
