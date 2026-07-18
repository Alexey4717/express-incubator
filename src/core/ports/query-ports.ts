import { ObjectId } from 'mongodb';

import type {
  RequestContextSecurityDevice,
  RequestContextUser,
} from '../types/request-context';

export interface IUserQueryPort {
  findUserById(id: ObjectId): Promise<RequestContextUser>;
}

export interface ISecurityDeviceQueryPort {
  findSecurityDeviceById(
    deviceId: ObjectId,
  ): Promise<RequestContextSecurityDevice>;
}
