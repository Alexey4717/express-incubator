import type { CreateVideoInputModel } from '../../models/CreateVideoInputModel';

export class CreateVideoCommand {
  constructor(public readonly input: CreateVideoInputModel) {}
}
