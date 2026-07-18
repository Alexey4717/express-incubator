import { ObjectId } from 'mongodb';

export class DeleteSecurityDeviceCommand {
  constructor(
    public readonly input: {
      deviceId: ObjectId;
      userId: ObjectId;
    },
  ) {}
}
