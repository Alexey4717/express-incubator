import { injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { JwtService } from '@/core/application/jwt-service';
import { settings } from '@/core/settings/index';

import type { GetUserOutputModelFromMongoDB } from '@/modules/users';

import { SecurityDevicesRepository } from '../repositories/CUD/security-devices-repository';

interface CreateSecurityDeviceArgs {
  user: GetUserOutputModelFromMongoDB;
  title: string;
  ip: string;
}

interface UpdateSecurityDeviceByIdArgs {
  deviceId: ObjectId;
  userId: ObjectId;
  title: string;
  ip: string;
}

interface DeleteAllSecurityDevicesOmitCurrentArgs {
  deviceId: ObjectId;
  userId: ObjectId;
}

@injectable()
export class SecurityDevicesService {
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected jwtService: JwtService,
  ) {}

  // after auth/login
  async createSecurityDevice({
    user,
    title,
    ip,
  }: CreateSecurityDeviceArgs): Promise<string | null> {
    const refreshTokenPayload = {
      userId: user._id,
      deviceId: new ObjectId(),
    };

    const refreshToken =
      await this.jwtService.createRefreshJWT(refreshTokenPayload);
    const { exp, iat } = jwt.verify(
      refreshToken,
      settings.REFRESH_JWT_SECRET,
    ) as JwtPayload;

    if (!exp || !iat) return null;

    const newSecurityDevice = {
      ip,
      title,
      lastActiveDate: new Date((iat as number) * 1000).toISOString(),
      _id: refreshTokenPayload.deviceId,
      userId: refreshTokenPayload.userId.toString(),
      expiredAt: new Date((exp as number) * 1000).toISOString(), // в ДЗ написано хранить в БД дату окончания токена чтобы чистить протухшие
      // как это делать пока не понятно
    };

    const insertedResult =
      await this.securityDevicesRepository.createSecurityDevice(
        newSecurityDevice,
      );

    return insertedResult ? refreshToken : null;
  }

  // for override LastActiveDate by issuedDate of new refreshToken
  // after auth/refresh-token
  async updateSecurityDeviceById({
    userId,
    deviceId,
    title,
    ip,
  }: UpdateSecurityDeviceByIdArgs): Promise<string | null> {
    const newRefreshTokenPayload = {
      userId: userId,
      deviceId: deviceId,
    };
    const newRefreshToken = await this.jwtService.createRefreshJWT(
      newRefreshTokenPayload,
    );

    const { iat, exp } = jwt.verify(
      newRefreshToken,
      settings.REFRESH_JWT_SECRET,
    ) as JwtPayload;
    const updateSecurityDeviceData = {
      ip,
      title,
      lastActiveDate: new Date((iat as number) * 1000).toISOString(),
      expiredAt: new Date((exp as number) * 1000).toISOString(),
    };

    const result =
      await this.securityDevicesRepository.updateSecurityDeviceById({
        deviceId,
        updateSecurityDeviceData,
      });

    return result ? newRefreshToken : null;
  }

  // after (method DELETE) security/devices
  async deleteAllSecurityDevicesOmitCurrent({
    deviceId,
    userId,
  }: DeleteAllSecurityDevicesOmitCurrentArgs): Promise<boolean> {
    return await this.securityDevicesRepository.deleteAllUserSecurityDevicesOmitCurrent(
      { deviceId, userId },
    );
  }

  // after auth/logout or (method DELETE) security/devices/:id
  async deleteSecurityDeviceById(deviceId: ObjectId): Promise<boolean> {
    return await this.securityDevicesRepository.deleteSecurityDeviceById(
      deviceId,
    );
  }
}
