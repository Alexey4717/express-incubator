export const USERS_TYPES = {
  IUsersRepository: Symbol.for('IUsersRepository'),
  IUsersQueryRepository: Symbol.for('IUsersQueryRepository'),
  IAuthUserOperations: Symbol.for('IAuthUserOperations'),
} as const;
