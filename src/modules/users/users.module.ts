import { Container } from 'inversify';

import { UserControllers } from './controllers/user-controllers';
import { UsersRepository } from './repositories/CUD/users-repository';
import { UsersQueryRepository } from './repositories/Queries/users-query-repository';
import { UsersService } from './services/users-service';
import { USERS_TYPES } from './users.tokens';

export const bindUsersModule = (container: Container): void => {
  container.bind(USERS_TYPES.IUsersRepository).to(UsersRepository);
  container.bind(USERS_TYPES.IUsersQueryRepository).to(UsersQueryRepository);
  container.bind(UsersService).toSelf();
  container.bind(UserControllers).toSelf();
};
