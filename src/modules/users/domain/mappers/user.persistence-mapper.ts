import type { TUserDb } from '../../models/GetUserOutputModel';
import { UserEntity } from '../entities/user.entity';

export const UserPersistenceMapper = {
  toDomain(raw: TUserDb): UserEntity {
    return UserEntity.reconstitute(raw);
  },

  toPersistence(entity: UserEntity): TUserDb {
    return entity.toDb();
  },
};
