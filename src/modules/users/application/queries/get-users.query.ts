import type { GetUsersArgs } from '../../models/GetUsersInputModel';

export class GetUsersQuery {
  constructor(public readonly args: GetUsersArgs) {}
}
