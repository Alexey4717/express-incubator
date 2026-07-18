import { inject, injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { JwtService } from '@/core/application/jwt-service';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';
import { settings } from '@/core/settings/index';

import type { TUserDb } from '@/modules/users';

import type { ISecurityDevicesQueryRepository } from '../repositories/contracts/ISecurityDevicesQueryRepository';
import type { ISecurityDevicesRepository } from '../repositories/contracts/ISecurityDevicesRepository';
import { SECURITY_DEVICES_TYPES } from '../security-devices.tokens';

interface CreateSecurityDeviceArgs {
  user: TUserDb;
  title: string;
  ip: string;
}

interface UpdateSecurityDeviceByIdArgs {
  deviceId: ObjectId;
  userId: ObjectId;
  oldRefreshTokenJti: string;
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
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    protected securityDevicesRepository: ISecurityDevicesRepository,
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesQueryRepository)
    protected securityDevicesQueryRepository: ISecurityDevicesQueryRepository,
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
    oldRefreshTokenJti,
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
        userId,
        oldRefreshTokenJti,
        updateSecurityDeviceData,
      });

    if (!result) {
      return fail(ResultStatus.Unauthorized, { reason: 'UpdateDeviceFailed' });
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
