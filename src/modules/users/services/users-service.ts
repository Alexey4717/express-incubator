import { injectable } from 'inversify';

import type { GetUsersArgs } from '../models/GetUsersInputModel';
import { UsersQueryRepository } from '../repositories/Queries/users-query-repository';

@injectable()
export class UsersService {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async findMany(query: GetUsersArgs) {
    return await this.usersQueryRepository.getUsers(query);
  }
}
