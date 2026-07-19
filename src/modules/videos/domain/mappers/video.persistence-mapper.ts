import type { TVideoDb } from '../../models/GetVideoOutputModel';
import { VideoEntity } from '../entities/video.entity';

export const VideoPersistenceMapper = {
  toDomain(raw: TVideoDb): VideoEntity {
    return VideoEntity.reconstitute(raw);
  },

  toPersistence(entity: VideoEntity): TVideoDb {
    return entity.toDb();
  },
};
