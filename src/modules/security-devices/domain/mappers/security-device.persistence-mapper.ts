import type { TSecurityDeviceDb } from '../../models/GetSecurityDeviceOutputModel';
import { SecurityDeviceEntity } from '../entities/security-device.entity';

export const SecurityDevicePersistenceMapper = {
  toDomain(raw: TSecurityDeviceDb): SecurityDeviceEntity {
    return SecurityDeviceEntity.reconstitute(raw);
  },

  toPersistence(entity: SecurityDeviceEntity): TSecurityDeviceDb {
    return entity.toDb();
  },
};
