import {
  GetMappedSecurityDeviceOutputModel,
  TSecurityDeviceDb,
} from '../models/GetSecurityDeviceOutputModel';

export const getMappedSecurityDevicesViewModel = ({
  _id,
  ip,
  title,
  lastActiveDate,
}: TSecurityDeviceDb): GetMappedSecurityDeviceOutputModel => {
  return {
    deviceId: _id.toString(),
    ip,
    title,
    lastActiveDate,
  };
};
