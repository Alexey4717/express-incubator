import { ObjectId } from 'mongodb';

import { SecurityDeviceEntity } from '../../domain/entities/security-device.entity';

type UpdateSecurityDeviceData = {
  ip: string;
  title: string;
  lastActiveDate: string;
  expiredAt: string;
  currentRefreshTokenJti: string;
};

interface UpdateSecurityDeviceByIdArgs {
  deviceId: ObjectId;
  userId: ObjectId;
  oldRefreshTokenJti: string;
  updateSecurityDeviceData: UpdateSecurityDeviceData;
}

interface DeleteAllUserSecurityDevicesOmitCurrentArgs {
  deviceId: ObjectId;
  userId: ObjectId;
}

export interface ISecurityDevicesRepository {
  createSecurityDevice(device: SecurityDeviceEntity): Promise<boolean>;
  updateSecurityDeviceById(
    args: UpdateSecurityDeviceByIdArgs,
  ): Promise<boolean>;
  deleteAllUserSecurityDevicesOmitCurrent(
    args: DeleteAllUserSecurityDevicesOmitCurrentArgs,
  ): Promise<boolean>;
  deleteSecurityDeviceById(deviceId: ObjectId): Promise<boolean>;
}
