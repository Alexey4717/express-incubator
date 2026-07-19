import { inject, injectable } from 'inversify';

import { BcryptService } from '@/core/application/bcrypt-service';
import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import { UserEntity } from '../../domain/entities/user.entity';
import type { IUsersRepository } from '../../repositories/contracts/IUsersRepository';
import { USERS_TYPES } from '../../users.tokens';
import { CreateUserCommand } from '../commands/create-user.command';

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
    protected bcryptService: BcryptService,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { login, email, password, isConfirmed = true } = command.input;
    const passwordHash = await this.bcryptService.generateHash(password);
    const user = UserEntity.create({
      login,
      email,
      passwordHash,
      isConfirmed,
    });
    const userId = await this.usersRepository.createUser(user);
    if (!userId) {
      throw domainException(DomainExceptionCode.BadRequest, 'CreateUserFailed');
    }
    return userId.toString();
  }
}
