import { Container } from 'inversify';

import { EmailAdapter } from './adapters/email-adapter';
import { BcryptService } from './application/bcrypt-service';
import { JwtService } from './application/jwt-service';
import { CORE_TYPES } from './core.tokens';

export const bindCoreModule = (container: Container): void => {
  container.bind(JwtService).toSelf();
  container.bind(BcryptService).toSelf();
  container.bind(CORE_TYPES.IEmailAdapter).to(EmailAdapter);
};
