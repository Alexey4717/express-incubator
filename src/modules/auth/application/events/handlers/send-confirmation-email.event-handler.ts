import { injectable } from 'inversify';

import { EmailNotificationService } from '../../services/email-notification.service';
import { RegistrationConfirmationEmailEvent } from '../registration-confirmation-email.event';

@injectable()
export class SendConfirmationEmailEventHandler {
  constructor(protected emailNotificationService: EmailNotificationService) {}

  async handle(event: RegistrationConfirmationEmailEvent): Promise<void> {
    const sent =
      await this.emailNotificationService.sendRegistrationConfirmation({
        email: event.email,
        confirmationCode: event.confirmationCode,
      });
    if (!sent) {
      throw new Error(
        `SendConfirmationEmailEventHandler: failed to send email to ${event.email}`,
      );
    }
  }
}
