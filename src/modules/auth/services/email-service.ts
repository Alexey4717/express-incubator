import { inject, injectable } from 'inversify';

import { IEmailAdapter } from '@/core/adapters/i-email-adapter';
import { CORE_TYPES } from '@/core/core.tokens';

import type { SendEmailConfirmationMessageInputType } from './types';

@injectable()
export class EmailService {
  constructor(
    @inject(CORE_TYPES.IEmailAdapter)
    protected emailAdapter: IEmailAdapter,
  ) {}

  async sendEmailConfirmationMessage({
    email,
    subject,
    message,
  }: SendEmailConfirmationMessageInputType): Promise<boolean> {
    return await this.emailAdapter.sendEmail({ email, subject, message });
  }

  async sendPasswordRecoveryMessage({
    email,
    subject,
    message,
  }: SendEmailConfirmationMessageInputType): Promise<boolean> {
    return await this.emailAdapter.sendEmail({ email, subject, message });
  }
}
