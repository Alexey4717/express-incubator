import type { UpdateBlogInputModel } from '../../models/UpdateBlogInputModel';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateBlogInputModel,
  ) {}
}
