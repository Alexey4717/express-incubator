import type { UpdatePostInputModel } from '../../models/UpdatePostInputModel';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdatePostInputModel,
  ) {}
}
