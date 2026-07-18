import { inject, injectable } from 'inversify';

import type { IUsersQueryRepository } from '../../repositories/contracts/IUsersQueryRepository';
import { USERS_TYPES } from '../../users.tokens';
import { GetUserByIdQuery } from './get-user-by-id.query';

@injectable()
export class GetUserByIdQueryHandler {
  constructor(
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
  ) {}

  async execute(query: GetUserByIdQuery) {
    return await this.usersQueryRepository.findUserViewById(query.id);
  }
}
