import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { GetSecurityDeviceOutputModelFromMongoDB } from '../../../security-devices/models/SecurityDeviceModels/GetSecurityDeviceOutputModel';
import SecurityDeviceModel from '../../../security-devices/models/SecurityDeviceModels/SecurityDevice-model';

@injectable()
export class SecurityDevicesQueryRepository {
  async getAllSecurityDevicesByUserId(
    userId: string,
  ): Promise<GetSecurityDeviceOutputModelFromMongoDB[]> {
    try {
      return await SecurityDeviceModel.find({ userId }).lean();
    } catch (error) {
      console.log(
        `SecurityDevicesQueryRepository.getAllSecurityDevicesByUserId error is occurred: ${error}`,
      );
      return [] as GetSecurityDeviceOutputModelFromMongoDB[];
    }
  }

  async findSecurityDeviceById(
    deviceId: ObjectId,
  ): Promise<GetSecurityDeviceOutputModelFromMongoDB | null> {
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
