import { inject, injectable } from 'inversify';

import { IEmailAdapter } from '@/core/adapters/i-email-adapter';
import { CORE_TYPES } from '@/core/core.tokens';

@injectable()
export class EmailNotificationService {
  constructor(
    @inject(CORE_TYPES.IEmailAdapter)
    protected emailAdapter: IEmailAdapter,
  ) {}

  async sendRegistrationConfirmation({
    email,
    confirmationCode,
  }: {
    email: string;
    confirmationCode: string;
  }): Promise<boolean> {
    return await this.emailAdapter.sendEmail({
      email,
      subject: 'Registration confirmation',
      message: `
                <p>To confirm registration please follow the link below:
                    <a href='${process.env.MAIN_URL}/confirm-registration?code=${confirmationCode}'>
                        confirm registration
                    </a>
                </p>
            `,
    });
  }

  async sendPasswordRecovery({
    email,
    recoveryCode,
  }: {
    email: string;
    recoveryCode: string;
  }): Promise<boolean> {
    return await this.emailAdapter.sendEmail({
      email,
      subject: 'Password recovery',
      message: `
                <h1>Password recovery</h1>
                <p>To finish password recovery please follow the link below:
                    <a href='${process.env.MAIN_URL}/password-recovery?recoveryCode=${recoveryCode}'>
                        recovery password
                    </a>
                </p>
            `,
    });
  }
}
