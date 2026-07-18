import { inject, injectable } from 'inversify';

import { BcryptService } from '@/core/application/bcrypt-service';
import { fail, ok } from '@/core/result/handle-result';
import { ResultStatus } from '@/core/result/result-code';
import type { Result } from '@/core/result/result.type';

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

  async execute(command: CreateUserCommand): Promise<Result<string>> {
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
      return fail(ResultStatus.BadRequest, { reason: 'CreateUserFailed' });
    }
    return ok(userId.toString());
  }
}
