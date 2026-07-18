import type { CreatePostInBlogInputModel } from '../../models/CreatePostInBlogInputModel';

export class CreatePostInBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly input: CreatePostInBlogInputModel,
  ) {}
}
