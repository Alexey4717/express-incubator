import { CreateSecurityDeviceCommand } from './commands/create-security-device.command';
import { DeleteAllSecurityDevicesExceptCurrentCommand } from './commands/delete-all-security-devices-except-current.command';
import { DeleteSecurityDeviceCommand } from './commands/delete-security-device.command';
import { UpdateSecurityDeviceCommand } from './commands/update-security-device.command';
import { GetSecurityDevicesQuery } from './queries/get-security-devices.query';
import { GetSecurityDevicesQueryHandler } from './queries/get-security-devices.query-handler';
import { CreateSecurityDeviceUseCase } from './usecases/create-security-device.usecase';
import { DeleteAllSecurityDevicesExceptCurrentUseCase } from './usecases/delete-all-security-devices-except-current.usecase';
import { DeleteSecurityDeviceUseCase } from './usecases/delete-security-device.usecase';
import { UpdateSecurityDeviceUseCase } from './usecases/update-security-device.usecase';

export const securityDevicesCommandRegistrations = [
  {
    command: CreateSecurityDeviceCommand,
    handler: CreateSecurityDeviceUseCase,
  },
  {
    command: UpdateSecurityDeviceCommand,
    handler: UpdateSecurityDeviceUseCase,
  },
  {
    command: DeleteSecurityDeviceCommand,
    handler: DeleteSecurityDeviceUseCase,
  },
  {
    command: DeleteAllSecurityDevicesExceptCurrentCommand,
    handler: DeleteAllSecurityDevicesExceptCurrentUseCase,
  },
] as const;

export const securityDevicesQueryRegistrations = [
  {
    query: GetSecurityDevicesQuery,
    handler: GetSecurityDevicesQueryHandler,
  },
] as const;
