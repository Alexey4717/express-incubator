import {VideosRepository} from "./repositories/CUD-repo/videos-repository";
import {VideosQueryRepository} from "./repositories/Queries-repo/videos-query-repository";
import {VideosService} from "./domain/videos-service";
import {VideoControllers} from "./controllers/video-controllers";

// repositories
const videosRepository = new VideosRepository();
const videosQueryRepository = new VideosQueryRepository();

// services
const videosService = new VideosService(videosRepository);

// controllers
export const videoControllers = new VideoControllers(videosQueryRepository, videosService);
