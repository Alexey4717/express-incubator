import { Container } from 'inversify';

import { AuthControllers } from './controllers/auth-controllers';
import { EmailManager } from './managers/email-manager';
import { AuthService } from './services/auth-service';
import { EmailService } from './services/email-service';

export const bindAuthModule = (container: Container): void => {
  container.bind(AuthService).toSelf();
  container.bind(EmailService).toSelf();
  container.bind(EmailManager).toSelf();
  container.bind(AuthControllers).toSelf();
};
