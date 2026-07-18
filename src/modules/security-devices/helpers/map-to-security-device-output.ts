import {
  GetMappedSecurityDeviceOutputModel,
  GetSecurityDeviceOutputModelFromMongoDB,
} from '../models/GetSecurityDeviceOutputModel';

export const getMappedSecurityDevicesViewModel = ({
  _id,
  ip,
  title,
  lastActiveDate,
}: GetSecurityDeviceOutputModelFromMongoDB): GetMappedSecurityDeviceOutputModel => {
  return {
    deviceId: _id.toString(),
    ip,
    title,
    lastActiveDate,
  };
};
