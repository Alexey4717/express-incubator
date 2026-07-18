import { ObjectId } from 'mongodb';

export class LogoutUserCommand {
  constructor(
    public readonly deviceId: ObjectId,
    public readonly userId: ObjectId,
  ) {}
}
