import type { CreatePostInputModel } from '../../models/CreatePostInputModel';

export class CreatePostCommand {
  constructor(public readonly input: CreatePostInputModel) {}
}
