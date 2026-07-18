import { Container } from 'inversify';

import { SecurityDeviceControllers } from './controllers/security-device-controllers';
import { SecurityDevicesRepository } from './repositories/CUD/security-devices-repository';
import { SecurityDevicesQueryRepository } from './repositories/Queries/security-devices-query-repository';
import { SECURITY_DEVICES_TYPES } from './security-devices.tokens';
import { SecurityDevicesService } from './services/security-devices-service';

export const bindSecurityDevicesModule = (container: Container): void => {
  container
    .bind(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    .to(SecurityDevicesRepository);
  container
    .bind(SECURITY_DEVICES_TYPES.ISecurityDevicesQueryRepository)
    .to(SecurityDevicesQueryRepository);
  container.bind(SecurityDevicesService).toSelf();
  container.bind(SecurityDeviceControllers).toSelf();
};
