import { injectable } from 'inversify';

import { EmailNotificationService } from '../../services/email-notification.service';
import { PasswordRecoveryRequestedEvent } from '../password-recovery-requested.event';

@injectable()
export class SendPasswordRecoveryEmailEventHandler {
  constructor(protected emailNotificationService: EmailNotificationService) {}

  async handle(event: PasswordRecoveryRequestedEvent): Promise<void> {
    try {
      const sent = await this.emailNotificationService.sendPasswordRecovery({
        email: event.email,
        recoveryCode: event.recoveryCode,
      });
      if (!sent) {
        console.error(
          `SendPasswordRecoveryEmailEventHandler: failed to send email to ${event.email}`,
        );
      }
    } catch (error) {
      console.error(`SendPasswordRecoveryEmailEventHandler error: ${error}`);
    }
  }
}
