import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { SecurityDeviceEntity } from '../../domain/entities/security-device.entity';
import { SecurityDevicePersistenceMapper } from '../../domain/mappers/security-device.persistence-mapper';
import SecurityDeviceModel from '../../models/SecurityDevice-model';
import type { ISecurityDevicesRepository } from '../contracts/ISecurityDevicesRepository';

type UpdateSecurityDeviceData = {
  ip: string;
  title: string;
  lastActiveDate: string;
  expiredAt: string;
  currentRefreshTokenJti: string;
};

interface updateSecurityDeviceByIdArgs {
  deviceId: ObjectId;
  userId: ObjectId;
  oldRefreshTokenJti: string;
  updateSecurityDeviceData: UpdateSecurityDeviceData;
}

interface DeleteAllUserSecurityDevicesOmitCurrentArgs {
  deviceId: ObjectId;
  userId: ObjectId;
}

@injectable()
export class SecurityDevicesRepository implements ISecurityDevicesRepository {
  async getSecurityDeviceById(
    deviceId: ObjectId,
  ): Promise<SecurityDeviceEntity | null> {
    try {
      const raw = await SecurityDeviceModel.findOne({
        _id: new ObjectId(deviceId),
      }).lean();
      return raw ? SecurityDevicePersistenceMapper.toDomain(raw) : null;
    } catch (error) {
      console.log(
        `SecurityDevicesRepository.getSecurityDeviceById error is occurred: ${error}`,
      );
      return null;
    }
  }

  async createSecurityDevice(device: SecurityDeviceEntity): Promise<boolean> {
    try {
      const data = SecurityDevicePersistenceMapper.toPersistence(device);
      const result = await SecurityDeviceModel.create(data);
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
    userId,
    oldRefreshTokenJti,
    updateSecurityDeviceData,
  }: updateSecurityDeviceByIdArgs): Promise<boolean> {
    try {
      const result = await SecurityDeviceModel.updateOne(
        {
          _id: new ObjectId(deviceId),
          userId: userId.toString(),
          currentRefreshTokenJti: oldRefreshTokenJti,
        },
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
      await SecurityDeviceModel.deleteMany({
        userId: userId.toString(),
        _id: { $ne: deviceId },
      });
      return true;
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
