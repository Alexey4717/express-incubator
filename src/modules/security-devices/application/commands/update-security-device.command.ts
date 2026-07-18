import { ObjectId } from 'mongodb';

export class UpdateSecurityDeviceCommand {
  constructor(
    public readonly input: {
      deviceId: ObjectId;
      userId: ObjectId;
      oldRefreshTokenJti: string;
      title: string;
      ip: string;
    },
  ) {}
}
