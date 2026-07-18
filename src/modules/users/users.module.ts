import { Container } from 'inversify';

import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query-handler';
import { GetUsersQueryHandler } from './application/queries/get-users.query-handler';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { UserControllers } from './controllers/user-controllers';
import { UsersRepository } from './repositories/CUD/users-repository';
import { UsersQueryRepository } from './repositories/Queries/users-query-repository';
import { USERS_TYPES } from './users.tokens';

export const bindUsersModule = (container: Container): void => {
  container.bind(USERS_TYPES.IUsersRepository).to(UsersRepository);
  container.bind(USERS_TYPES.IUsersQueryRepository).to(UsersQueryRepository);

  container.bind(CreateUserUseCase).toSelf();
  container.bind(DeleteUserUseCase).toSelf();
  container.bind(GetUsersQueryHandler).toSelf();
  container.bind(GetUserByIdQueryHandler).toSelf();
  container.bind(UserControllers).toSelf();
};
