import type { UpdateVideoInputModel } from '../../models/UpdateVideoInputModel';

export class UpdateVideoCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateVideoInputModel,
  ) {}
}
