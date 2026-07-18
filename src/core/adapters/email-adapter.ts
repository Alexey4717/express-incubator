import { injectable } from 'inversify';
import nodemailer from 'nodemailer';

import { IEmailAdapter } from './i-email-adapter';
import { SendEmailInputType } from './types';

@injectable()
export class EmailAdapter implements IEmailAdapter {
  async sendEmail({
    email,
    subject,
    message,
  }: SendEmailInputType): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    try {
      const user = process.env.NODEMAILER_USER_TRANSPORT;
      const pass = process.env.NODEMAILER_PASSWORD_TRANSPORT;

      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });

      await transport.sendMail({
        from: `Alexey <${user}>`,
        to: email,
        subject,
        html: message,
      });

      return true;
    } catch (error) {
      console.error(`EmailAdapter.sendEmail error is occurred: ${error}`);
      return false;
    }
  }
}
