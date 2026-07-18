import type { TUserDb } from '@/modules/users';

export class UserRegisteredEvent {
  constructor(public readonly user: TUserDb) {}
}
