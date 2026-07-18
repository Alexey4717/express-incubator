import { Container } from 'inversify';

import { GetSecurityDevicesQueryHandler } from './application/queries/get-security-devices.query-handler';
import { CreateSecurityDeviceUseCase } from './application/usecases/create-security-device.usecase';
import { DeleteAllSecurityDevicesExceptCurrentUseCase } from './application/usecases/delete-all-security-devices-except-current.usecase';
import { DeleteSecurityDeviceUseCase } from './application/usecases/delete-security-device.usecase';
import { UpdateSecurityDeviceUseCase } from './application/usecases/update-security-device.usecase';
import { SecurityDeviceControllers } from './controllers/security-device-controllers';
import { SecurityDevicesRepository } from './repositories/CUD/security-devices-repository';
import { SecurityDevicesQueryRepository } from './repositories/Queries/security-devices-query-repository';
import { SECURITY_DEVICES_TYPES } from './security-devices.tokens';

export const bindSecurityDevicesModule = (container: Container): void => {
  container
    .bind(SECURITY_DEVICES_TYPES.ISecurityDevicesRepository)
    .to(SecurityDevicesRepository);
  container
    .bind(SECURITY_DEVICES_TYPES.ISecurityDevicesQueryRepository)
    .to(SecurityDevicesQueryRepository);

  container.bind(CreateSecurityDeviceUseCase).toSelf();
  container.bind(UpdateSecurityDeviceUseCase).toSelf();
  container.bind(DeleteSecurityDeviceUseCase).toSelf();
  container.bind(DeleteAllSecurityDevicesExceptCurrentUseCase).toSelf();
  container.bind(GetSecurityDevicesQueryHandler).toSelf();
  container.bind(SecurityDeviceControllers).toSelf();
};
