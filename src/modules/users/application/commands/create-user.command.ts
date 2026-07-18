import type { CreateUserInputModel } from '../../models/CreateUserInputModel';

export class CreateUserCommand {
  constructor(
    public readonly input: CreateUserInputModel & { isConfirmed?: boolean },
  ) {}
}
