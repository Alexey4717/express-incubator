import { model, Schema } from 'mongoose';

import { GetSecurityDeviceOutputModel } from './GetSecurityDeviceOutputModel';

const SecurityDeviceSchema = new Schema<GetSecurityDeviceOutputModel>({
  ip: { type: String, required: true },
  title: { type: String, required: true },
  lastActiveDate: { type: String, required: true },
  userId: { type: String, required: true },
  expiredAt: { type: String, required: true },
});

export default model(
  'SecurityDevice',
  SecurityDeviceSchema,
  'security-devices',
);
