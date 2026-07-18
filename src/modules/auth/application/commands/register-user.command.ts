import type { CreateUserInputModel } from '@/modules/users';

export class RegisterUserCommand {
  constructor(public readonly input: CreateUserInputModel) {}
}
