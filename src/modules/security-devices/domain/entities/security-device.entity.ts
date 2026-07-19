import { ObjectId } from 'mongodb';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import type { TSecurityDeviceDb } from '../../models/GetSecurityDeviceOutputModel';

export type SecurityDeviceCreateProps = {
  id: ObjectId;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
  expiredAt: string;
  currentRefreshTokenJti: string;
};

export class SecurityDeviceEntity {
  private constructor(private data: TSecurityDeviceDb) {}

  static create(props: SecurityDeviceCreateProps): SecurityDeviceEntity {
    return new SecurityDeviceEntity({
      _id: props.id,
      userId: props.userId,
      ip: props.ip,
      title: props.title,
      lastActiveDate: props.lastActiveDate,
      expiredAt: props.expiredAt,
      currentRefreshTokenJti: props.currentRefreshTokenJti,
    });
  }

  static reconstitute(raw: TSecurityDeviceDb): SecurityDeviceEntity {
    return new SecurityDeviceEntity({ ...raw, _id: raw._id });
  }

  get id(): ObjectId {
    return this.data._id;
  }

  toDb(): TSecurityDeviceDb {
    return { ...this.data };
  }

  belongsTo(userId: ObjectId): boolean {
    return this.data.userId === userId.toString();
  }

  canBeDeletedBy(userId: ObjectId): void {
    if (!this.belongsTo(userId)) {
      throw domainException(DomainExceptionCode.Forbidden, 'NotOwner');
    }
  }
}
