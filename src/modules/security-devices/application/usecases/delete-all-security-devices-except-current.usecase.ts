import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import type { ISecurityDevicesRepository } from '../../repositories/contracts/ISecurityDevicesRepository';
import { SECURITY_DEVICES_TYPES } from '../../security-devices.tokens';
import { DeleteAllSecurityDevicesExceptCurrentCommand } from '../commands/delete-all-security-devices-except-current.command';

@injectable()
export class DeleteAllSecurityDevicesExceptCurrentUseCase {
  constructor(
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    protected securityDevicesRepository: ISecurityDevicesRepository,
  ) {}

  async execute(
    command: DeleteAllSecurityDevicesExceptCurrentCommand,
  ): Promise<null> {
    const { deviceId, userId } = command.input;
    const deleted =
      await this.securityDevicesRepository.deleteAllUserSecurityDevicesOmitCurrent(
        { deviceId, userId },
      );
    if (!deleted) {
      throw domainException(
        DomainExceptionCode.BadRequest,
        'DeleteDevicesFailed',
      );
    }
    return null;
  }
}
