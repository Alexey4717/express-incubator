import { injectable } from 'inversify';

import { EmailNotificationService } from '../../services/email-notification.service';
import { PasswordRecoveryRequestedEvent } from '../password-recovery-requested.event';

@injectable()
export class SendPasswordRecoveryEmailEventHandler {
  constructor(protected emailNotificationService: EmailNotificationService) {}

  async handle(event: PasswordRecoveryRequestedEvent): Promise<void> {
    const sent = await this.emailNotificationService.sendPasswordRecovery({
      email: event.email,
      recoveryCode: event.recoveryCode,
    });
    if (!sent) {
      throw new Error(
        `SendPasswordRecoveryEmailEventHandler: failed to send email to ${event.email}`,
      );
    }
  }
}
