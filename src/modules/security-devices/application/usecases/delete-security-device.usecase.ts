import { inject, injectable } from 'inversify';

import { mapDomainError } from '@/core/domain/map-domain-error';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import { SecurityDeviceEntity } from '../../domain/entities/security-device.entity';
import type { ISecurityDevicesQueryRepository } from '../../repositories/contracts/ISecurityDevicesQueryRepository';
import type { ISecurityDevicesRepository } from '../../repositories/contracts/ISecurityDevicesRepository';
import { SECURITY_DEVICES_TYPES } from '../../security-devices.tokens';
import { DeleteSecurityDeviceCommand } from '../commands/delete-security-device.command';

@injectable()
export class DeleteSecurityDeviceUseCase {
  constructor(
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    protected securityDevicesRepository: ISecurityDevicesRepository,
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesQueryRepository)
    protected securityDevicesQueryRepository: ISecurityDevicesQueryRepository,
  ) {}

  async execute(command: DeleteSecurityDeviceCommand): Promise<Result<null>> {
    const { deviceId, userId } = command.input;
    const foundDevice =
      await this.securityDevicesQueryRepository.findSecurityDeviceById(
        deviceId,
      );

    if (!foundDevice) {
      return fail(ResultStatus.NotFound, { reason: 'DeviceNotFound' });
    }

    const device = SecurityDeviceEntity.reconstitute(foundDevice);
    try {
      device.canBeDeletedBy(userId);
    } catch (error) {
      return mapDomainError(error);
    }

    const deleted =
      await this.securityDevicesRepository.deleteSecurityDeviceById(deviceId);
    if (!deleted) {
      return fail(ResultStatus.BadRequest, { reason: 'DeleteDeviceFailed' });
    }
    return ok(null);
  }
}
