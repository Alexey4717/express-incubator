import type { TUserDb } from '@/modules/users';

export class CreateSecurityDeviceCommand {
  constructor(
    public readonly input: {
      user: TUserDb;
      title: string;
      ip: string;
    },
  ) {}
}
