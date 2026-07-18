import { ObjectId } from 'mongodb';

import { TSecurityDeviceDb } from '../../models/GetSecurityDeviceOutputModel';

export interface ISecurityDevicesQueryRepository {
  getAllSecurityDevicesByUserId(userId: string): Promise<TSecurityDeviceDb[]>;
  findSecurityDeviceById(deviceId: ObjectId): Promise<TSecurityDeviceDb | null>;
}
