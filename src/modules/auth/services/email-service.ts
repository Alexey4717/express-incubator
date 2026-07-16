import { injectable } from 'inversify';

import { emailAdapter } from '../../../core/adapters/email-adapter';
import type { SendEmailConfirmationMessageInputType } from './types';

@injectable()
export class EmailService {
  async sendEmailConfirmationMessage({
    email,
    subject,
    message,
  }: SendEmailConfirmationMessageInputType): Promise<boolean> {
    return await emailAdapter.sendEmail({ email, subject, message });
  }

  async sendPasswordRecoveryMessage({
    email,
    subject,
    message,
  }: SendEmailConfirmationMessageInputType): Promise<boolean> {
    return await emailAdapter.sendEmail({ email, subject, message });
  }
}
