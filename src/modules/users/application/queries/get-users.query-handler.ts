import { inject, injectable } from 'inversify';

import type { IUsersQueryRepository } from '../../repositories/contracts/IUsersQueryRepository';
import { USERS_TYPES } from '../../users.tokens';
import { GetUsersQuery } from './get-users.query';

@injectable()
export class GetUsersQueryHandler {
  constructor(
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
  ) {}

  async execute(query: GetUsersQuery) {
    return await this.usersQueryRepository.getUsers(query.args);
  }
}
