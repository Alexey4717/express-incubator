import type { TBlogDb } from '../../models/GetBlogOutputModel';
import { BlogEntity } from '../entities/blog.entity';

export const BlogPersistenceMapper = {
  toDomain(raw: TBlogDb): BlogEntity {
    return BlogEntity.reconstitute(raw);
  },

  toPersistence(entity: BlogEntity): TBlogDb {
    return entity.toDb();
  },
};
