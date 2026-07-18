import { CreateUserCommand } from './commands/create-user.command';
import { DeleteUserCommand } from './commands/delete-user.command';
import { GetUserByIdQuery } from './queries/get-user-by-id.query';
import { GetUserByIdQueryHandler } from './queries/get-user-by-id.query-handler';
import { GetUsersQuery } from './queries/get-users.query';
import { GetUsersQueryHandler } from './queries/get-users.query-handler';
import { CreateUserUseCase } from './usecases/create-user.usecase';
import { DeleteUserUseCase } from './usecases/delete-user.usecase';

export const usersCommandRegistrations = [
  { command: CreateUserCommand, handler: CreateUserUseCase },
  { command: DeleteUserCommand, handler: DeleteUserUseCase },
] as const;

export const usersQueryRegistrations = [
  { query: GetUsersQuery, handler: GetUsersQueryHandler },
  { query: GetUserByIdQuery, handler: GetUserByIdQueryHandler },
] as const;
