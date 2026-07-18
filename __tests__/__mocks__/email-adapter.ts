import { injectable } from 'inversify';

import { IEmailAdapter } from '@/core/adapters/i-email-adapter';
import { SendEmailInputType } from '@/core/adapters/types';

@injectable()
export class EmailAdapter implements IEmailAdapter {
  async sendEmail(_input: SendEmailInputType): Promise<boolean> {
    return true;
  }
}
