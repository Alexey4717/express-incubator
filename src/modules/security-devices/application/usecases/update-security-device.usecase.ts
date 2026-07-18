import { inject, injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { JwtService } from '@/core/application/jwt-service';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';
import { settings } from '@/core/settings/index';

import type { ISecurityDevicesRepository } from '../../repositories/contracts/ISecurityDevicesRepository';
import { SECURITY_DEVICES_TYPES } from '../../security-devices.tokens';
import { UpdateSecurityDeviceCommand } from '../commands/update-security-device.command';

@injectable()
export class UpdateSecurityDeviceUseCase {
  constructor(
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    protected securityDevicesRepository: ISecurityDevicesRepository,
    protected jwtService: JwtService,
  ) {}

  async execute(command: UpdateSecurityDeviceCommand): Promise<Result<string>> {
    const { userId, deviceId, oldRefreshTokenJti, title, ip } = command.input;
    const newRefreshTokenPayload = {
      userId,
      deviceId,
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
}
