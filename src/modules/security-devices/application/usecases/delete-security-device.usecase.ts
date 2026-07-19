import { inject, injectable } from 'inversify';

import { mapDomainError } from '@/core/domain/map-domain-error';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

import type { ISecurityDevicesRepository } from '../../repositories/contracts/ISecurityDevicesRepository';
import { SECURITY_DEVICES_TYPES } from '../../security-devices.tokens';
import { DeleteSecurityDeviceCommand } from '../commands/delete-security-device.command';

@injectable()
export class DeleteSecurityDeviceUseCase {
  constructor(
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    protected securityDevicesRepository: ISecurityDevicesRepository,
  ) {}

  async execute(command: DeleteSecurityDeviceCommand): Promise<Result<null>> {
    const { deviceId, userId } = command.input;
    const device =
      await this.securityDevicesRepository.getSecurityDeviceById(deviceId);

    if (!device) {
      return fail(ResultStatus.NotFound, { reason: 'DeviceNotFound' });
    }

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
