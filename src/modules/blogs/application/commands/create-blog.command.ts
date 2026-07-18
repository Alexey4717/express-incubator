import type { CreateBlogInputModel } from '../../models/CreateBlogInputModel';

export class CreateBlogCommand {
  constructor(public readonly input: CreateBlogInputModel) {}
}
