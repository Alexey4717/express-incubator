import type { TPostDb } from '../../models/GetPostOutputModel';
import { PostEntity } from '../entities/post.entity';

export const PostPersistenceMapper = {
  toDomain(raw: TPostDb): PostEntity {
    return PostEntity.reconstitute(raw);
  },

  toPersistence(entity: PostEntity): TPostDb {
    return entity.toDb();
  },
};
