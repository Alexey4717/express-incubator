import { injectable } from 'inversify';

import { EmailNotificationService } from '../../services/email-notification.service';
import { UserRegisteredEvent } from '../user-registered.event';

@injectable()
export class SendConfirmationEmailEventHandler {
  constructor(protected emailNotificationService: EmailNotificationService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      const sent =
        await this.emailNotificationService.sendRegistrationConfirmation({
          email: event.user.accountData.email,
          confirmationCode: event.user.emailConfirmation.confirmationCode,
        });
      if (!sent) {
        console.error(
          `SendConfirmationEmailEventHandler: failed to send email to ${event.user.accountData.email}`,
        );
      }
    } catch (error) {
      console.error(`SendConfirmationEmailEventHandler error: ${error}`);
    }
  }
}
