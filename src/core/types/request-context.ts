import { ObjectId } from 'mongodb';

type ContextAccountData = {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type ContextEmailConfirmation = {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
};

type ContextRecoveryData = {
  recoveryCode: string;
  expirationDate: Date;
};

export type RequestContextUser = {
  _id: ObjectId;
  accountData: ContextAccountData;
  emailConfirmation: ContextEmailConfirmation;
  recoveryData: ContextRecoveryData | null;
} | null;

export type RequestContextSecurityDevice = {
  _id: ObjectId;
  ip: string;
  title: string;
  lastActiveDate: string;
  userId: string;
  expiredAt: string;
  currentRefreshTokenJti: string;
} | null;

export type RequestContextType = {
  user: RequestContextUser;
  securityDevice: RequestContextSecurityDevice;
};
