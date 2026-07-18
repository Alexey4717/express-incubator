import { inject, injectable } from 'inversify';

import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

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
  ): Promise<Result<null>> {
    const { deviceId, userId } = command.input;
    const deleted =
      await this.securityDevicesRepository.deleteAllUserSecurityDevicesOmitCurrent(
        { deviceId, userId },
      );
    if (!deleted) {
      return fail(ResultStatus.BadRequest, { reason: 'DeleteDevicesFailed' });
    }
    return ok(null);
  }
}
