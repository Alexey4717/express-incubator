import type { Result } from '@/core/result/result.type';

import type { CreateUserInputModel } from '../models/CreateUserInputModel';

export interface IAuthUserOperations {
  createUser(input: CreateUserInputModel): Promise<Result<string>>;
  deleteUserById(id: string): Promise<Result<null>>;
}
