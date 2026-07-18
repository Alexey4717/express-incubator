export const SECURITY_DEVICES_TYPES = {
  ISecurityDevicesRepository: Symbol.for('ISecurityDevicesRepository'),
  ISecurityDevicesQueryRepository: Symbol.for(
    'ISecurityDevicesQueryRepository',
  ),
} as const;
