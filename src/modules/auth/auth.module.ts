import { Container } from 'inversify';

import { USERS_TYPES } from '@/modules/users';

import { AuthControllers } from './controllers/auth-controllers';
import { EmailManager } from './managers/email-manager';
import { AuthService } from './services/auth-service';
import { EmailService } from './services/email-service';

export const bindAuthModule = (container: Container): void => {
  container.bind(AuthService).toSelf();
  container.bind(USERS_TYPES.IAuthUserOperations).toService(AuthService);
  container.bind(EmailService).toSelf();
  container.bind(EmailManager).toSelf();
  container.bind(AuthControllers).toSelf();
};
