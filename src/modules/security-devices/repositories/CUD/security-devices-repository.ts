import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { GetSecurityDeviceOutputModelFromMongoDB } from '../../../security-devices/models/SecurityDeviceModels/GetSecurityDeviceOutputModel';
import SecurityDeviceModel from '../../../security-devices/models/SecurityDeviceModels/SecurityDevice-model';

type UpdateSecurityDeviceData = {
  ip: string;
  title: string;
  lastActiveDate: string;
  expiredAt: string;
};

interface updateSecurityDeviceByIdArgs {
  deviceId: ObjectId;
  updateSecurityDeviceData: UpdateSecurityDeviceData;
}

interface DeleteAllUserSecurityDevicesOmitCurrentArgs {
  deviceId: ObjectId;
  userId: ObjectId;
}

@injectable()
export class SecurityDevicesRepository {
  async createSecurityDevice(
    newDevice: GetSecurityDeviceOutputModelFromMongoDB,
  ): Promise<boolean> {
    try {
      const result = await SecurityDeviceModel.create(newDevice);
      return Boolean(result._id);
    } catch (error) {
      console.log(
        `SecurityDevicesRepository.createSecurityDevice error is occurred: ${error}`,
      );
      return false;
    }
  }

  async updateSecurityDeviceById({
    deviceId,
    updateSecurityDeviceData,
  }: updateSecurityDeviceByIdArgs): Promise<boolean> {
    try {
      const result = await SecurityDeviceModel.updateOne(
        { _id: new ObjectId(deviceId) },
        { $set: { ...updateSecurityDeviceData } },
      );

      return result?.matchedCount === 1;
    } catch (error) {
      console.log(
        `SecurityDevicesRepository.updateSecurityDeviceById error is occurred: ${error}`,
      );
      return false;
    }
  }

  async deleteAllUserSecurityDevicesOmitCurrent({
    deviceId,
    userId,
  }: DeleteAllUserSecurityDevicesOmitCurrentArgs): Promise<boolean> {
    try {
      const result = await SecurityDeviceModel.deleteMany({
        userId: userId.toString(),
        _id: { $ne: deviceId },
      });
      return result?.deletedCount > 0;
    } catch (error) {
      console.log(
        `SecurityDevicesRepository.deleteAllUserSecurityDevicesOmitCurrent error is occurred: ${error}`,
      );
      return false;
    }
  }

  async deleteSecurityDeviceById(deviceId: ObjectId): Promise<boolean> {
    try {
      const result = await SecurityDeviceModel.deleteOne({
        _id: new ObjectId(deviceId),
      });
      return result?.deletedCount === 1;
    } catch (error) {
      console.log(
        `SecurityDevicesRepository.deleteSecurityDeviceById error is occurred: ${error}`,
      );
      return false;
    }
  }
}
