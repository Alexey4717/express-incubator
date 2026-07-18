import { WithId } from 'mongodb';

export type GetSecurityDeviceOutputModel = {
  /**
   * security device ip
   */
  ip: string;

  /**
   * security device title
   */
  title: string;

  /**
   * last active date of security device
   */
  lastActiveDate: string;

  /**
   * current user id of security device
   */
  userId: string;

  /**
   * expired Date refreshToken of security device
   */
  expiredAt: string;
};

export type TSecurityDeviceDb = WithId<GetSecurityDeviceOutputModel>;

export type GetMappedSecurityDeviceOutputModel = Omit<
  GetSecurityDeviceOutputModel,
  'userId' | 'expiredAt'
> & {
  /**
   * id of security device
   */
  deviceId: string;
};
