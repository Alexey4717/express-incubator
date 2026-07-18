import { Container } from 'inversify';

import { EmailAdapter } from './adapters/email-adapter';
import { BcryptService } from './application/bcrypt-service';
import { JwtService } from './application/jwt-service';
import { CORE_TYPES } from './core.tokens';
import { CommandBus } from './cqrs/buses/command-bus';
import { EventBus } from './cqrs/buses/event-bus';
import { QueryBus } from './cqrs/buses/query-bus';
import { CQRS_TYPES } from './cqrs/cqrs.tokens';
import { LikeStatusRepository } from './repositories/like-status-repository';

export const bindCoreModule = (container: Container): void => {
  container.bind(JwtService).toSelf();
  container.bind(BcryptService).toSelf();
  container.bind(CORE_TYPES.IEmailAdapter).to(EmailAdapter);
  container.bind(CORE_TYPES.ILikeStatusRepository).to(LikeStatusRepository);
  container.bind(CQRS_TYPES.CommandBus).to(CommandBus).inSingletonScope();
  container.bind(CQRS_TYPES.QueryBus).to(QueryBus).inSingletonScope();
  container.bind(CQRS_TYPES.EventBus).to(EventBus).inSingletonScope();
};
