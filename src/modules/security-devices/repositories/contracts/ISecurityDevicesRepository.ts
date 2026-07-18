import { ObjectId } from 'mongodb';

import { TSecurityDeviceDb } from '../../models/GetSecurityDeviceOutputModel';

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
  createSecurityDevice(newDevice: TSecurityDeviceDb): Promise<boolean>;
  updateSecurityDeviceById(
    args: UpdateSecurityDeviceByIdArgs,
  ): Promise<boolean>;
  deleteAllUserSecurityDevicesOmitCurrent(
    args: DeleteAllUserSecurityDevicesOmitCurrentArgs,
  ): Promise<boolean>;
  deleteSecurityDeviceById(deviceId: ObjectId): Promise<boolean>;
}
