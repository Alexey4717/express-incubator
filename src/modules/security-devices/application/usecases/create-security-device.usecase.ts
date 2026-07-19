import { inject, injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { JwtService } from '@/core/application/jwt-service';
import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';
import { settings } from '@/core/settings/index';

import { SecurityDeviceEntity } from '../../domain/entities/security-device.entity';
import type { ISecurityDevicesRepository } from '../../repositories/contracts/ISecurityDevicesRepository';
import { SECURITY_DEVICES_TYPES } from '../../security-devices.tokens';
import { CreateSecurityDeviceCommand } from '../commands/create-security-device.command';

@injectable()
export class CreateSecurityDeviceUseCase {
  constructor(
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    protected securityDevicesRepository: ISecurityDevicesRepository,
    protected jwtService: JwtService,
  ) {}

  async execute(command: CreateSecurityDeviceCommand): Promise<string> {
    const { user, title, ip } = command.input;
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
      throw domainException(
        DomainExceptionCode.BadRequest,
        'TokenGenerationFailed',
      );
    }

    const device = SecurityDeviceEntity.create({
      id: refreshTokenPayload.deviceId,
      userId: refreshTokenPayload.userId.toString(),
      ip,
      title,
      lastActiveDate: new Date((iat as number) * 1000).toISOString(),
      expiredAt: new Date((exp as number) * 1000).toISOString(),
      currentRefreshTokenJti: jti,
    });

    const insertedResult =
      await this.securityDevicesRepository.createSecurityDevice(device);

    if (!insertedResult) {
      throw domainException(
        DomainExceptionCode.BadRequest,
        'CreateDeviceFailed',
      );
    }
    return refreshToken;
  }
}
