import { inject, injectable } from 'inversify';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

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
    const user = await this.usersQueryRepository.findUserViewById(query.id);
    if (!user) {
      throw domainException(DomainExceptionCode.NotFound, 'UserNotFound');
    }
    return user;
  }
}
