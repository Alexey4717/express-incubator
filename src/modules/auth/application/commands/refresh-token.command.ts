import { ObjectId } from 'mongodb';

import type { TUserDb } from '@/modules/users';

export class RefreshTokenCommand {
  constructor(
    public readonly user: TUserDb,
    public readonly deviceId: ObjectId,
    public readonly oldRefreshTokenJti: string,
    public readonly userAgent: string,
    public readonly ip: string,
  ) {}
}
