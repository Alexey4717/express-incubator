import { injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { JwtService } from '@/core/application/jwt-service';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';
import { settings } from '@/core/settings/index';

import type { TUserDb } from '@/modules/users';

import { SecurityDevicesRepository } from '../repositories/CUD/security-devices-repository';
import { SecurityDevicesQueryRepository } from '../repositories/Queries/security-devices-query-repository';

interface CreateSecurityDeviceArgs {
  user: TUserDb;
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
    protected securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    protected jwtService: JwtService,
  ) {}

  async createSecurityDevice({
    user,
    title,
    ip,
  }: CreateSecurityDeviceArgs): Promise<Result<string>> {
    const refreshTokenPayload = {
      userId: user._id,
      deviceId: new ObjectId(),
    };

    const { token: refreshToken, jti } =
      await this.jwtService.createRefreshJWT(refreshTokenPayload);
    const { exp, iat } = jwt.verify(
      refreshToken,
      settings.REFRESH_JWT_SECRET,
    ) as JwtPayload;

    if (!exp || !iat) {
      return fail(ResultStatus.BadRequest, { reason: 'TokenGenerationFailed' });
    }

    const newSecurityDevice = {
      ip,
      title,
      lastActiveDate: new Date((iat as number) * 1000).toISOString(),
      _id: refreshTokenPayload.deviceId,
      userId: refreshTokenPayload.userId.toString(),
      expiredAt: new Date((exp as number) * 1000).toISOString(),
      currentRefreshTokenJti: jti,
    };

    const insertedResult =
      await this.securityDevicesRepository.createSecurityDevice(
        newSecurityDevice,
      );

    if (!insertedResult) {
      return fail(ResultStatus.BadRequest, { reason: 'CreateDeviceFailed' });
    }
    return ok(refreshToken);
  }

  async updateSecurityDeviceById({
    userId,
    deviceId,
    title,
    ip,
  }: UpdateSecurityDeviceByIdArgs): Promise<Result<string>> {
    const newRefreshTokenPayload = {
      userId: userId,
      deviceId: deviceId,
    };
    const { token: newRefreshToken, jti } =
      await this.jwtService.createRefreshJWT(newRefreshTokenPayload);

    const { iat, exp } = jwt.verify(
      newRefreshToken,
      settings.REFRESH_JWT_SECRET,
    ) as JwtPayload;
    const updateSecurityDeviceData = {
      ip,
      title,
      lastActiveDate: new Date((iat as number) * 1000).toISOString(),
      expiredAt: new Date((exp as number) * 1000).toISOString(),
      currentRefreshTokenJti: jti,
    };

    const result =
      await this.securityDevicesRepository.updateSecurityDeviceById({
        deviceId,
        updateSecurityDeviceData,
      });

    if (!result) {
      return fail(ResultStatus.BadRequest, { reason: 'UpdateDeviceFailed' });
    }
    return ok(newRefreshToken);
  }

  async deleteAllSecurityDevicesOmitCurrent({
    deviceId,
    userId,
  }: DeleteAllSecurityDevicesOmitCurrentArgs): Promise<Result<null>> {
    const deleted =
      await this.securityDevicesRepository.deleteAllUserSecurityDevicesOmitCurrent(
        { deviceId, userId },
      );
    if (!deleted) {
      return fail(ResultStatus.BadRequest, { reason: 'DeleteDevicesFailed' });
    }
    return ok(null);
  }

  async deleteSecurityDeviceById(
    deviceId: ObjectId,
    userId: ObjectId,
  ): Promise<Result<null>> {
    const foundDevice =
      await this.securityDevicesQueryRepository.findSecurityDeviceById(
        deviceId,
      );

    if (!foundDevice) {
      return fail(ResultStatus.NotFound, { reason: 'DeviceNotFound' });
    }

    if (foundDevice.userId !== userId.toString()) {
      return fail(ResultStatus.Forbidden, { reason: 'NotOwner' });
    }

    const deleted =
      await this.securityDevicesRepository.deleteSecurityDeviceById(deviceId);
    if (!deleted) {
      return fail(ResultStatus.BadRequest, { reason: 'DeleteDeviceFailed' });
    }
    return ok(null);
  }
}
