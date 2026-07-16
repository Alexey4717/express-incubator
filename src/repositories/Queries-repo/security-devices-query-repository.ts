import { ObjectId } from 'mongodb';

import { GetSecurityDeviceOutputModelFromMongoDB } from '../../models/SecurityDeviceModels/GetSecurityDeviceOutputModel';
import { securityDevicesCollection } from '../../store/db';

export const securityDevicesQueryRepository = {
  async getAllSecurityDevicesByUserId(
    userId: string,
  ): Promise<GetSecurityDeviceOutputModelFromMongoDB[]> {
    try {
      return await securityDevicesCollection.find({ userId }).toArray();
    } catch (error) {
      console.log(
        `securityDevicesQueryRepository.getAllSecurityDevicesByUserId error is occurred: ${error}`,
      );
      return [] as GetSecurityDeviceOutputModelFromMongoDB[];
    }
  },

  async findSecurityDeviceById(
    deviceId: ObjectId,
  ): Promise<GetSecurityDeviceOutputModelFromMongoDB | null> {
    try {
      return await securityDevicesCollection.findOne({ _id: deviceId });
    } catch (error) {
      console.log(
        `securityDevicesQueryRepository.getSecurityDeviceById error is occurred: ${error}`,
      );
      return null;
    }
  },
};
