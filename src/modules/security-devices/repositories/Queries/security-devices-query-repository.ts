import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { TSecurityDeviceDb } from '../../models/GetSecurityDeviceOutputModel';
import SecurityDeviceModel from '../../models/SecurityDevice-model';
import type { ISecurityDevicesQueryRepository } from '../contracts/ISecurityDevicesQueryRepository';

@injectable()
export class SecurityDevicesQueryRepository implements ISecurityDevicesQueryRepository {
  async getAllSecurityDevicesByUserId(
    userId: string,
  ): Promise<TSecurityDeviceDb[]> {
    try {
      return await SecurityDeviceModel.find({ userId }).lean();
    } catch (error) {
      console.log(
        `SecurityDevicesQueryRepository.getAllSecurityDevicesByUserId error is occurred: ${error}`,
      );
      return [] as TSecurityDeviceDb[];
    }
  }

  async findSecurityDeviceById(
    deviceId: ObjectId,
  ): Promise<TSecurityDeviceDb | null> {
    try {
      return await SecurityDeviceModel.findOne({ _id: deviceId }).lean();
    } catch (error) {
      console.log(
        `SecurityDevicesQueryRepository.getSecurityDeviceById error is occurred: ${error}`,
      );
      return null;
    }
  }
}
