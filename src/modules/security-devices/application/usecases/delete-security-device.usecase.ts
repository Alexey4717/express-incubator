import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import type { ISecurityDevicesRepository } from '../../repositories/contracts/ISecurityDevicesRepository';
import { SECURITY_DEVICES_TYPES } from '../../security-devices.tokens';
import { DeleteSecurityDeviceCommand } from '../commands/delete-security-device.command';

@injectable()
export class DeleteSecurityDeviceUseCase {
  constructor(
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    protected securityDevicesRepository: ISecurityDevicesRepository,
  ) {}

  async execute(command: DeleteSecurityDeviceCommand): Promise<null> {
    const { deviceId, userId } = command.input;
    const device =
      await this.securityDevicesRepository.getSecurityDeviceById(deviceId);

    if (!device) {
      throw domainException(DomainExceptionCode.NotFound, 'DeviceNotFound');
    }

    device.canBeDeletedBy(userId);

    const deleted =
      await this.securityDevicesRepository.deleteSecurityDeviceById(deviceId);
    if (!deleted) {
      throw domainException(
        DomainExceptionCode.InternalServerError,
        'DeleteDeviceFailed',
      );
    }
    return null;
  }
}
