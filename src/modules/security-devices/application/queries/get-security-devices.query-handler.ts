import { inject, injectable } from 'inversify';

import type { ISecurityDevicesQueryRepository } from '../../repositories/contracts/ISecurityDevicesQueryRepository';
import { SECURITY_DEVICES_TYPES } from '../../security-devices.tokens';
import { GetSecurityDevicesQuery } from './get-security-devices.query';

@injectable()
export class GetSecurityDevicesQueryHandler {
  constructor(
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesQueryRepository)
    protected securityDevicesQueryRepository: ISecurityDevicesQueryRepository,
  ) {}

  async execute(query: GetSecurityDevicesQuery) {
    return await this.securityDevicesQueryRepository.getAllSecurityDevicesByUserId(
      query.userId,
    );
  }
}
