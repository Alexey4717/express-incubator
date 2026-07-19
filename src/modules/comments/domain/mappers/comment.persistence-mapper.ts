import type { TCommentDb } from '../../models/GetCommentOutputModel';
import { CommentEntity } from '../entities/comment.entity';

export const CommentPersistenceMapper = {
  toDomain(raw: TCommentDb): CommentEntity {
    return CommentEntity.reconstitute(raw);
  },

  toPersistence(entity: CommentEntity): TCommentDb {
    return entity.toDb();
  },
};
