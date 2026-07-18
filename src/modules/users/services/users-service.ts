import { inject, injectable } from 'inversify';

import type { GetUsersArgs } from '../models/GetUsersInputModel';
import type { IUsersQueryRepository } from '../repositories/contracts/IUsersQueryRepository';
import { USERS_TYPES } from '../users.tokens';

@injectable()
export class UsersService {
  constructor(
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
  ) {}

  async findMany(query: GetUsersArgs) {
    return await this.usersQueryRepository.getUsers(query);
  }
}
