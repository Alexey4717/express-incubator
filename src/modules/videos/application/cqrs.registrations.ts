import { CreateVideoCommand } from './commands/create-video.command';
import { DeleteVideoCommand } from './commands/delete-video.command';
import { UpdateVideoCommand } from './commands/update-video.command';
import { GetVideoByIdQuery } from './queries/get-video-by-id.query';
import { GetVideosQuery } from './queries/get-videos.query';
import {
  GetVideoByIdQueryHandler,
  GetVideosQueryHandler,
} from './queries/videos.query-handlers';
import {
  CreateVideoUseCase,
  DeleteVideoUseCase,
  UpdateVideoUseCase,
} from './usecases/videos.usecases';

export const videosCommandRegistrations = [
  { command: CreateVideoCommand, handler: CreateVideoUseCase },
  { command: UpdateVideoCommand, handler: UpdateVideoUseCase },
  { command: DeleteVideoCommand, handler: DeleteVideoUseCase },
] as const;

export const videosQueryRegistrations = [
  { query: GetVideosQuery, handler: GetVideosQueryHandler },
  { query: GetVideoByIdQuery, handler: GetVideoByIdQueryHandler },
] as const;
