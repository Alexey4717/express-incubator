import { ObjectId } from 'mongodb';

export class DeleteAllSecurityDevicesExceptCurrentCommand {
  constructor(
    public readonly input: {
      deviceId: ObjectId;
      userId: ObjectId;
    },
  ) {}
}
