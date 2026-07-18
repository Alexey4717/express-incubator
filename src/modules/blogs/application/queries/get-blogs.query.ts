import type { GetBlogsArgs } from '../../models/GetBlogsInputModel';

export class GetBlogsQuery {
  constructor(public readonly args: GetBlogsArgs) {}
}
